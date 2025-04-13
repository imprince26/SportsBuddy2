import { Upload, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const UploadProgress = ({ progress, error, className }) => {
  const isComplete = progress === 100;
  const hasError = !!error;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2">
        {hasError ? (
          <AlertCircle className="text-[#FF5252] animate-pulse" />
        ) : isComplete ? (
          <CheckCircle className="text-[#4CAF50] animate-bounce" />
        ) : (
          <Upload className="text-[#4CAF50] animate-spin" />
        )}
        <div className="flex-1">
          <div className="h-2 bg-[#1D4E4E]/30 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full transition-all duration-300 rounded-full",
                hasError
                  ? "bg-[#FF5252]"
                  : isComplete
                  ? "bg-[#4CAF50]"
                  : "bg-[#81C784] animate-pulse"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <span className="text-sm text-[#81C784] min-w-[40px]">
          {hasError ? "Error" : `${progress}%`}
        </span>
      </div>
      {hasError && (
        <p className="text-sm text-[#FF5252] text-center">{error}</p>
      )}
    </div>
  );
};

export default UploadProgress;