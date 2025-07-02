import React, { useState, useRef, useEffect, useContext } from "react";
import ProcessModel from "../../components/ProcessModel";
import { AppContext } from "../../context/AppContext";
import { formatWithCommas } from "../../utils/formatWithComma";

const GeneralReportTable = ({
  generalProcesses,
  allClients,
  startDate,
  endDate,
  selectedFilter,
}) => {
  const tableRef = useRef();
  const { userData } = useContext(AppContext);

  // Filter processes based on processAmountBuy
  const filteredProcesses = generalProcesses.filter((process) => {
    if (selectedFilter === "less") {
      return (process.processAmountBuy || 0) < 10000;
    } else if (selectedFilter === "greater") {
      return (process.processAmountBuy || 0) >= 10000;
    }
    return true;
  });

  // Group processes by client
  const clientsWithProcesses = allClients.map((client) => {
    const clientProcesses = filteredProcesses.filter(
      (process) => process.clientId?._id === client._id
    );
    return {
      ...client,
      processes: clientProcesses,
      processCount: clientProcesses.length,
      totalAmount: clientProcesses.reduce(
        (sum, process) => sum + (process.processAmountBuy || 0),
        0
      ),
    };
  });

  // Filter clients based on selected filter
  const filteredClients = clientsWithProcesses.filter((client) => {
    if (selectedFilter === "greater") return client;
    if (selectedFilter === "less") return client;
    return true;
  });

  console.log(filteredClients, "fasfaf");

  const totalClients = filteredClients.length;
  const totalProcesses = filteredClients.reduce(
    (acc, client) => acc + client.processCount,
    0
  );

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title =
      selectedFilter === "greater" ? "Greater than 10000" : "Less than 10000";
    window.print();
    document.title = originalTitle;
  };

  const [showProcesses, setShowProcesses] = useState(false);
  const [selectedClient, setSelectedClient] = useState("");

  const clientProcesses = filteredProcesses.filter(
    (process) => process.clientId?._id === selectedClient
  );

  return (
    <div className="rounded-xl border border-gray-200 shadow-sm text-sm bg-white p-4">
      {/* Filter & Print */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 print:hidden">
        <div className="text-sm font-medium">
          Showing: {selectedFilter === "greater" ? "> $10,000" : "< $10,000"}
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
          <h2 className="text-lg font-bold mb-1">
            {selectedFilter === "greater"
              ? "Greater than $10,000"
              : "Less than $10,000"}
          </h2>
          <p className="text-sm text-gray-700">
            {startDate && endDate
              ? `From ${new Date(startDate).toLocaleDateString()} to ${new Date(
                  endDate
                ).toLocaleDateString()}`
              : "Full Report"}
          </p>
        </div>

        {/* Table */}
        {filteredClients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-left text-xs">
              <thead className="bg-gradient-to-r from-blue-50 to-purple-50 text-gray-600 uppercase tracking-wide">
                <tr>
                  <th className="px-3 py-2 border border-black">إسم العميل</th>
                  <th className="px-3 py-2 border border-black">رقم الهاتف</th>
                  <th className="px-3 py-2 border border-black">
                    عدد العمليات
                  </th>
                  <th className="px-3 py-2 border border-black">المجموع</th>
                  <th className="px-3 py-2 border border-black">
                    الموظف المسؤول
                  </th>
                  <th className="px-3 py-2 print:hidden border border-black">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredClients.map(
                  (client) =>
                    client.processCount > 0 && (
                      <tr key={client._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 whitespace-nowrap border border-black">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">
                              {client.fullname}
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
                          ${formatWithCommas(client.totalAmount)}
                        </td>
                        <td className="px-3 py-2 border border-black">
                          {client.employeeId?.username || "N/A"}
                        </td>
                        <td className="px-3 py-2 print:hidden border border-black">
                          <button
                            disabled={!userData.accessProcesses}
                            onClick={() => {
                              setShowProcesses(true);
                              setSelectedClient(client._id);
                            }}
                            className={`text-blue-600 hover:text-blue-800 font-medium ${
                              !userData.accessProcesses && "cursor-not-allowed"
                            }`}
                          >
                            عرض
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
                <strong>عدد العملاء:</strong> {totalClients}
              </p>
              <p>
                <strong>عدد العمليات:</strong> {totalProcesses}
              </p>
              <p>
                <strong>Filter:</strong>{" "}
                {selectedFilter === "greater" ? "> $10,000" : "< $10,000"}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-sm p-4">
            No data available for the selected filter.
          </p>
        )}
      </div>

      {/* Process Modal */}
      {showProcesses && (
        <ProcessModel
          selectedFilter={selectedFilter}
          clientProcesses={clientProcesses}
          SelectedClient={selectedClient}
          onClose={() => setShowProcesses(false)}
        />
      )}
    </div>
  );
};

export default GeneralReportTable;
