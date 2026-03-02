export default function ProgressBar({ progress, label = "Progress", showLabel = true }) {
    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{label}</span>
                    <span>{progress}%</span>
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
}
