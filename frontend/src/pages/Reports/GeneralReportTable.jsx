import React, { useState, useRef, useEffect, useContext } from "react";
import ProcessModel from "../../components/ProcessModel";
import { AppContext } from "../../context/AppContext";

const GeneralReportTable = ({
  generalProcesses,
  allClients,
  startDate,
  endDate,
}) => {
  const [selectedFilter, setSelectedFilter] = useState("");
  const tableRef = useRef();

  console.log(generalProcesses);

  const clientsWithProcessCount = allClients.map((client) => {
    const processCount = generalProcesses.filter(
      (process) => process.clientId?._id === client._id
    ).length;
    return { ...client, processCount };
  });

  const filteredClients = clientsWithProcessCount.filter((client) => {
    if (selectedFilter === "greater")
      return client.clientType === "greater than 10000";
    if (selectedFilter === "less")
      return client.clientType === "less than 10000";
    return true;
  });

  const totalClients = filteredClients.length;
  const totalProcesses = filteredClients.reduce(
    (acc, client) => acc + client.processCount,
    0
  );

  const { userData } = useContext(AppContext);

  const handlePrint = () => {
    window.print(); // Native print dialog; no DOM manipulation needed
  };

  const [showProcesses, setShowProcesses] = useState(false);
  const [SelectedClient, setSelectedClient] = useState("");

  const clientProcesses = generalProcesses.filter(
    (process) => process.clientId?._id === SelectedClient
  );

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm text-sm bg-white p-4">
      {/* Filter & Print */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 print:hidden">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedFilter === "less"}
              onChange={() =>
                setSelectedFilter((prev) => (prev === "less" ? "" : "less"))
              }
              className="accent-blue-600 w-4 h-4"
            />
            أقل من 10000
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={selectedFilter === "greater"}
              onChange={() =>
                setSelectedFilter((prev) =>
                  prev === "greater" ? "" : "greater"
                )
              }
              className="accent-blue-600 w-4 h-4"
            />
            أكثر من 10000
          </label>
        </div>

        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          Print Table
        </button>
      </div>

      {/* Printable Content */}
      <div ref={tableRef} className="print-area">
        {/* Header Info for Print */}
        <div className="mb-4 text-center hidden print:block">
          <h2 className="text-lg font-bold mb-1">Client Process Report</h2>
          <p className="text-sm text-gray-700">
            {startDate && endDate
              ? `From ${startDate} to ${endDate}`
              : "Full Report"}
          </p>
        </div>

        {/* Table */}
        {filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 border border-black">Client Name</th>
                  <th className="px-3 py-2 border border-black">Phone</th>
                  <th className="px-3 py-2 border border-black">
                    # of Processes
                  </th>

                  <th className="px-3 py-2 border border-black">Employee</th>
                  <th className="px-3 py-2 print:hidden border border-black">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredClients.map(
                  (client) =>
                    client.processes.length > 0 && (
                      <tr key={client._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap border border-black">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">
                              {client.fullname}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {client.clientType === "greater than 10000"
                                ? "أكثر"
                                : "أقل"}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2 border border-black">
                          {client.phoneNumber || "N/A"}
                        </td>
                        <td className="px-3 py-2 border border-black">
                          <span
                            className={`px-2 py-0.5 inline-flex text-[10px] font-semibold rounded-full ${
                              client.processCount > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {client.processCount}
                          </span>
                        </td>

                        <td className="px-3 py-2 border border-black">
                          {client.employeeId?.username || "N/A"}
                        </td>
                        <td className="px-3 py-2 print:hidden border border-black">
                          <button
                            onClick={() => {
                              setShowProcesses(true);
                              setSelectedClient(client._id);
                            }}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                )}
              </tbody>
            </table>

            {/* Summary Section (Print only) */}
            <div className="hidden print:block mt-6 text-sm text-gray-700">
              <p>
                <strong>Total Clients:</strong> {totalClients}
              </p>
              <p>
                <strong>Total Processes:</strong> {totalProcesses}
              </p>
            </div>

            {/* Signature (Print only) */}
            <div className="hidden print:block mt-10">
              <p className="text-sm text-gray-700">Signature:</p>
              <div className="border-t border-gray-400 w-64 mt-2"></div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm p-4">No data available.</p>
        )}
      </div>
      {/* fill the actual details for each process and add a function to be able to press on it and open a model that contain the process  to be able to update it  */}
      {showProcesses && (
        <div>
          {/* Close Button */}
          <ProcessModel
            clientProcesses={clientProcesses}
            SelectedClient={SelectedClient}
            onClose={() => setShowProcesses(false)}
          />
        </div>
      )}
    </div>
  );
};

export default GeneralReportTable;
