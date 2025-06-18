import React from "react";

const StatusMessage = ({ successMessage, errorMessage }) => {
  if (!successMessage && !errorMessage) return null;

  return (
    <div className="px-6 pt-6">
      <div
        className={`p-4 rounded-lg ${
          successMessage
            ? "bg-green-50 border-l-4 border-green-500 text-green-700"
            : "bg-red-50 border-l-4 border-red-500 text-red-700"
        }`}
      >
        <div className="flex items-start">
          <svg
            className={`flex-shrink-0 h-5 w-5 mt-0.5 mr-3 ${
              successMessage ? "text-green-500" : "text-red-500"
            }`}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {successMessage ? (
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
          <div>
            <p className="text-sm font-medium">
              {successMessage || errorMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusMessage;
