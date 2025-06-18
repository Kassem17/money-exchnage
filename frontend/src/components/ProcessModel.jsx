import React, { useEffect, useRef, useState } from "react";
import EditProcess from "./EditProcess";

const ProcessModel = ({ onClose, clientProcesses, SelectedClient }) => {
  const clientName = clientProcesses[0]?.clientId?.fullname || "Unknown Client";
  const [showEditModel, setShowEditModel] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState(null);

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-GB"); // DD/MM/YYYY format
  };

  const min = clientProcesses[0]?.clientId.minimum;
  const max = clientProcesses[0]?.clientId.maximum;



  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const totalBuy = clientProcesses.reduce(
    (sum, p) => sum + (p.processAmountBuy || 0),
    0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Client Processes
            </h2>
            <p className="text-sm text-gray-600">{clientName}</p>
            <p className="text-sm text-gray-600">
              {min}-{max}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Table Container */}
        <div className="overflow-y-auto flex-1">
          {clientProcesses.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exchange
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (Sell)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount (Buy)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clientProcesses.map((process) => (
                  <tr
                    key={process._id}
                    className="hover:bg-gray-50 cursor-pointer text-left"
                    
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(process.processDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                      {process.processType}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-medium">
                        {process.fromCurrency}
                      </span>{" "}
                      →
                      <span className="font-medium"> {process.toCurrency}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">
                      {process.processAmountSell || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500 font-medium">
                      {process.processAmountBuy || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProcess(process);
                          setShowEditModel(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No processes found for this client
              </p>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {clientProcesses.length > 0 && (
          <div className="sticky bottom-0 bg-gray-50 px-6 py-3 border-t flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {clientProcesses.length} processes
            </p>
            <div className="flex space-x-4">
              <p className="text-sm">
                <span className="text-gray-600">Total Sell:</span>
                <span className="font-medium text-red-500 ml-2">
                  {clientProcesses.reduce(
                    (sum, p) => sum + (p.processAmountSell || 0),
                    0
                  )}
                </span>
              </p>
              <p className="text-sm">
                <span className="text-gray-600">Total Buy:</span>
                <span
                  className={`font-medium ml-2 ${
                    totalBuy < min
                      ? "text-red-500"
                      : totalBuy > max
                      ? "text-blue-500"
                      : "text-yellow-500"
                  }`}
                >
                  {totalBuy} (
                  {totalBuy < min ? "Less" : totalBuy > max ? "High" : "Medium"}
                  )
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModel && selectedProcess && (
          <EditProcess
            process={selectedProcess}
            onClose={() => {
              setShowEditModel(false);
              setSelectedProcess(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProcessModel;
