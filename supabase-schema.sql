-- ==========================================
-- SUPERBASE SCHEMA FOR LEARNHUB LMS
-- Run this entire script in your Supabase SQL Editor
-- ==========================================

-- 1. Create CUSTOM TYPES
CREATE TYPE user_role AS ENUM ('student', 'tutor', 'admin');

-- 2. Create PROFILES table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Note: Enable RLS on Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone." 
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." 
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." 
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create profile on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 3. Create COURSES table
CREATE TABLE public.courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
-- Everyone can see published courses
CREATE POLICY "Anyone can view published courses" ON public.courses FOR SELECT USING (is_published = true);
-- Tutors can see their own unpublished courses and insert/update them
CREATE POLICY "Tutors can view all their own courses" ON public.courses FOR SELECT USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can insert their own courses" ON public.courses FOR INSERT WITH CHECK (auth.uid() = tutor_id);
CREATE POLICY "Tutors can update their own courses" ON public.courses FOR UPDATE USING (auth.uid() = tutor_id);
CREATE POLICY "Tutors can delete their own courses" ON public.courses FOR DELETE USING (auth.uid() = tutor_id);


-- 4. Create MODULES table
CREATE TABLE public.modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  list_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Tutors can manage modules for their courses" ON public.modules FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = modules.course_id AND tutor_id = auth.uid()));


-- 5. Create LESSONS table
CREATE TABLE public.lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT, -- Markdown or HTML text
  video_url TEXT,
  pdf_url TEXT,
  list_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view lessons" ON public.lessons FOR SELECT USING (true);
CREATE POLICY "Tutors can manage lessons" ON public.lessons FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM public.modules m 
    JOIN public.courses c ON m.course_id = c.id 
    WHERE m.id = lessons.module_id AND c.tutor_id = auth.uid()
  ));


-- 6. Create ENROLLMENTS table
CREATE TABLE public.enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(student_id, course_id)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own enrollments" ON public.enrollments FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can insert their own enrollments" ON public.enrollments FOR INSERT WITH CHECK (auth.uid() = student_id);
CREATE POLICY "Tutors can view enrollments for their courses" ON public.enrollments FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.courses WHERE id = enrollments.course_id AND tutor_id = auth.uid()));


-- 7. Create PROGRESS table
CREATE TABLE public.progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, lesson_id)
);

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Students can view their own progress" ON public.progress FOR SELECT USING (auth.uid() = student_id);
CREATE POLICY "Students can update their own progress" ON public.progress FOR ALL USING (auth.uid() = student_id);
CREATE POLICY "Tutors can view progress for their courses" ON public.progress FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON l.module_id = m.id
    JOIN public.courses c ON m.course_id = c.id
    WHERE l.id = progress.lesson_id AND c.tutor_id = auth.uid()
  ));


-- 8. Create SUBMISSIONS table
CREATE TABLE public.submissions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL, -- The assignment
  file_url TEXT NOT NULL,
  grade VARCHAR(10),
  feedback TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
-- Students can insert and view their own
CREATE POLICY "Students manage own submissions" ON public.submissions FOR ALL USING (auth.uid() = student_id);
-- Tutors can view and update grades on submissions for their courses
CREATE POLICY "Tutors manage submissions for their courses" ON public.submissions FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.lessons l
    JOIN public.modules m ON l.module_id = m.id
    JOIN public.courses c ON m.course_id = c.id
    WHERE l.id = submissions.lesson_id AND c.tutor_id = auth.uid()
  ));


-- ==========================================
-- STORAGE BUCKETS
-- ==========================================
INSERT INTO storage.buckets (id, name, public) VALUES ('course-media', 'course-media', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('submissions', 'submissions', false);

-- Set up basic public access for media rules
CREATE POLICY "Public Access for Media" ON storage.objects FOR SELECT USING (bucket_id = 'course-media');
CREATE POLICY "Tutors can upload media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-media' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'tutor');
CREATE POLICY "Students can upload submissions" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'submissions' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'student');
