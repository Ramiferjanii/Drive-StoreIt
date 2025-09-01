"use client";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import Image from "next/image";
import { actionsDropdownItems } from "@/constants";
import Link from "next/link";
import { constructDownloadUrl } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  deleteFile,
  renameFile,
  updateFileUsers,
} from "@/lib/actions/file.actions";
import { usePathname } from "next/navigation";
import { FileDetails, ShareInput } from "@/components/ActionsModalContent";
import { useToast } from "@/hooks/use-toast";

const ActionDropdown = ({ file }: { file: FileDocument }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  // Initialize name without extension for better UX
  const [name, setName] = useState(file.name.replace(`.${file.extension}`, ''));
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const { toast } = useToast();

  const path = usePathname();

  // Check for both old and new field names for backward compatibility
  const storageId = file.bucketFileId || (file as { bucketField?: string }).bucketField;
  
  // If file is invalid, render nothing but don't break hooks rules
  if (!file || !file.$id || !storageId) {
    console.error("Invalid file object:", file);
    return (
      <div className="text-red-500 text-sm p-2">
        Invalid file data
      </div>
    );
  }

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setName(file.name.replace(`.${file.extension}`, ''));
    //   setEmails([]);
  };

  const handleAction = async () => {
    if (!action) return;
    
    // Validate required parameters
    if (!file.$id) {
      console.error("Missing file ID");
      return;
    }
    
    setIsLoading(true);
    let success = false;

    try {
      const actions = {
        rename: () =>
          renameFile({ 
            fileId: file.$id, 
            name: name.trim(), 
            extension: file.extension, 
            path 
          }),
        share: () => updateFileUsers({ fileId: file.$id, emails, path }),
        delete: () => {
          // Check for both old and new field names for backward compatibility
          const storageId = file.bucketFileId || (file as { bucketField?: string }).bucketField;
          if (!storageId) {
            console.error("Missing storage ID for file:", file);
            throw new Error("File storage ID is missing");
          }
          return deleteFile({ fileId: file.$id, bucketFileId: storageId, path });
        },
      };

      success = await actions[action.value as keyof typeof actions]();

      if (success) {
        if (action.value === "delete") {
          // Show success message for delete
          toast({
            description: (
              <p className="body-2 text-white">
                <span className="font-semibold">{file.name}</span> has been deleted successfully.
              </p>
            ),
            className: "success-toast",
          });
        }
        closeAllModals();
      }
    } catch (error) {
      console.error("Action failed:", error);
      
      // Show error toast to user
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast({
        description: (
          <p className="body-2 text-white">
            Failed to {action?.value}: {errorMessage}
          </p>
        ),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async (email: string) => {
    const updatedEmails = emails.filter((e) => e !== email);

    const success = await updateFileUsers({
      fileId: file.$id,
      emails: updatedEmails,
      path,
    });

    if (success) setEmails(updatedEmails);
    closeAllModals();
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          {value === "details" && <FileDetails file={file} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete{` `}
              <span className="delete-file-name">{file.name}</span>?
            </p>
          )}
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-3 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src="/assets/icons/loader.svg"
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src="/assets/icons/dots.svg"
            alt="dots"
            width={34}
            height={34}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {file.name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map((actionItem) => (
            <DropdownMenuItem
              key={actionItem.value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction(actionItem);

                if (
                  ["rename", "share", "delete", "details"].includes(
                    actionItem.value,
                  )
                ) {
                  setIsModalOpen(true);
                }
              }}
            >
              {actionItem.value === "download" ? (
                (() => {
                  // Check for both old and new field names for backward compatibility
                  const storageId = file.bucketFileId || (file as { bucketField?: string }).bucketField;
                  return storageId ? (
                    <Link
                      href={constructDownloadUrl(storageId)}
                      download={file.name}
                      className="flex items-center gap-2"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Image
                        src={actionItem.icon}
                        alt={actionItem.label}
                        width={30}
                        height={30}
                      />
                      {actionItem.label}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400 cursor-not-allowed">
                      <Image
                        src={actionItem.icon}
                        alt={actionItem.label}
                        width={30}
                        height={30}
                      />
                      {actionItem.label} (Unavailable)
                    </div>
                  );
                })()
              ) : (
                <div className="flex items-center gap-2">
                  <Image
                    src={actionItem.icon}
                    alt={actionItem.label}
                    width={30}
                    height={30}
                  />
                  {actionItem.label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};
export default ActionDropdown;
