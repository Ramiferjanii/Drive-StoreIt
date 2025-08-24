import Image from "next/image";
import Link from "next/link";

import { Separator } from "@/components/ui/separator";
import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { usageSummary } from "@/constants";
import { Models } from "node-appwrite";

const Dashboard = async () => {
  // Parallel requests
  const [files, totalSpace] = await Promise.all([
    getFiles({ types: [], limit: 10 }),
    getTotalSpaceUsed(),
  ]);

  return (
    <div className="dashboard-container">
      <section>
        <h2 className="h3 xl:h2 text-light-100 mb-6">File Type Overview</h2>

        {/* Uploaded file type summaries */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => {
            const typeData = totalSpace[summary.type as keyof typeof totalSpace];
            const fileCount = files.documents.filter(
              (file: any) => file.type === summary.type
            ).length;
            
            return (
              <Link
                href={summary.url}
                key={summary.title}
                className="dashboard-summary-card"
              >
                <div className="space-y-4">
                  <div className="flex justify-between gap-3">
                    <Image
                      src={summary.icon}
                      width={100}
                      height={100}
                      alt={`${summary.title} icon`}
                      className="summary-type-icon"
                    />
                    <div className="text-right">
                      <p className="text-sm text-light-400">{fileCount} files</p>
                      <p className="text-xs text-light-500">
                        {typeData ? `${(typeData.size / (1024 * 1024)).toFixed(1)} MB` : '0 MB'}
                      </p>
                    </div>
                  </div>

                  <h5 className="summary-type-title">{summary.title}</h5>
                  <Separator className="bg-light-400" />
                </div>
              </Link>
            );
          })}
        </ul>
      </section>

      {/* Storage Usage Summary */}
      <section className="mt-8">
        <h2 className="h3 xl:h2 text-light-100 mb-4">Storage Usage</h2>
        <div className="bg-light-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-light-400">Used: {(totalSpace.used / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
            <span className="text-sm text-light-400">Total: {(totalSpace.all / (1024 * 1024 * 1024)).toFixed(2)} GB</span>
          </div>
          <div className="w-full bg-light-300 rounded-full h-2">
            <div 
              className="bg-brand h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(totalSpace.used / totalSpace.all) * 100}%` }}
            ></div>
          </div>
        </div>
      </section>

      {/* Recent files uploaded */}
      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
        {files.documents.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.documents.map((file: any) => (
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file.$id}
              >
                <div className="recent-file-details">
                  <div className="flex flex-col gap-1">
                    <p className="recent-file-name">{file.name}</p>
                    <p className="text-sm text-light-400">{file.type} • {(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
