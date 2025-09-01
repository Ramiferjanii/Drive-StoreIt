"use server";

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { InputFile } from "node-appwrite/file";
import { appwriteConfig } from "@/lib/appwrite/config";
import { ID, Query } from "node-appwrite";
import { constructFileUrl, getFileType, parseStringify } from "@/lib/utils";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/actions/user.actions";


// Interface for Appwrite errors
interface AppwriteError extends Error {
  code?: string | number;
  response?: Record<string, unknown>;
}

const handleError = (error: unknown, message: string) => {
  console.error("File Action Error:", { error, message });
  
  // If it's an Appwrite error, extract more details
  if (error && typeof error === 'object' && 'message' in error) {
    const appwriteError = error as AppwriteError;
    console.error("Appwrite Error Details:", {
      message: appwriteError.message,
      code: appwriteError.code,
      response: appwriteError.response
    });
  }
  
  throw new Error(`${message}: ${error instanceof Error ? error.message : String(error)}`);
};

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  path,
}: UploadFileProps) => {
  try {
    // Validate environment variables
    if (!appwriteConfig.bucketId || !appwriteConfig.databaseId || !appwriteConfig.filesCollectionId) {
      throw new Error("Missing required Appwrite configuration. Please check your environment variables.");
    }

    const { storage, databases } = await createAdminClient();

    if (!storage || !databases) {
      throw new Error("Failed to create Appwrite client");
    }

    const inputFile = InputFile.fromBuffer(file, file.name);

    const bucketFile = await storage.createFile(
      appwriteConfig.bucketId,
      ID.unique(),
      inputFile,
    );

    const fileDocument = {
      type: getFileType(bucketFile.name).type,
      name: bucketFile.name,
      url: constructFileUrl(bucketFile.$id),
      extension: getFileType(bucketFile.name).extension,
      size: bucketFile.sizeOriginal,
      owner: ownerId,
      accountId,
      users: [],
      bucketFileId: bucketFile.$id,
    };

    const newFile = await databases
      .createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.filesCollectionId,
        ID.unique(),
        fileDocument,
      )
      .catch(async (error: unknown) => {
        // Clean up the uploaded file if document creation fails
        try {
          await storage.deleteFile(appwriteConfig.bucketId, bucketFile.$id);
        } catch (cleanupError) {
          console.error("Failed to cleanup bucket file:", cleanupError);
        }
        throw error;
      });

    revalidatePath(path);
    return parseStringify(newFile);
  } catch (error) {
    console.error("Upload File Error:", error);
    handleError(error, "Failed to upload file");
  }
};

const createQueries = (
  currentUser: UserDocument,
  types: string[],
  searchText: string,
  sort: string,
  limit?: number,
) => {
  const queries = [
    Query.or([
      Query.equal("owner", [currentUser.$id]),
      Query.contains("users", [currentUser.email]),
    ]),
  ];

  if (types.length > 0) queries.push(Query.equal("type", types));
  if (searchText) queries.push(Query.contains("name", searchText));
  if (limit) queries.push(Query.limit(limit));

  if (sort) {
    const [sortBy, orderBy] = sort.split("-");

    queries.push(
      orderBy === "asc" ? Query.orderAsc(sortBy) : Query.orderDesc(sortBy),
    );
  }

  return queries;
};

export const getFiles = async ({
  types = [],
  searchText = "",
  sort = "$createdAt-desc",
  limit,
}: GetFilesProps) => {
  const { databases } = await createAdminClient();

  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) throw new Error("User not found");

    const queries = createQueries(currentUser, types, searchText, sort, limit);

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      queries,
    );

    console.log({ files });
    return parseStringify(files);
  } catch (error) {
    handleError(error, "Failed to get files");
  }
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: RenameFileProps) => {
  try {
    // Validate required parameters
    if (!fileId) {
      throw new Error("Missing required parameter: fileId");
    }
    if (!name) {
      throw new Error("Missing required parameter: name");
    }
    if (!extension) {
      throw new Error("Missing required parameter: extension");
    }
    if (!path) {
      throw new Error("Missing required parameter: path");
    }

    const { databases } = await createAdminClient();

    if (!databases) {
      throw new Error("Failed to create Appwrite client");
    }

    const newName = `${name}.${extension}`;
    console.log("Renaming file:", { fileId, newName, path });
    
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        name: newName,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    console.error("Rename file error:", { fileId, name, extension, path, error });
    handleError(error, "Failed to rename file");
  }
};

export const updateFileUsers = async ({
  fileId,
  emails,
  path,
}: UpdateFileUsersProps) => {
  try {
    // Validate required parameters
    if (!fileId) {
      throw new Error("Missing required parameter: fileId");
    }
    if (!emails) {
      throw new Error("Missing required parameter: emails");
    }
    if (!path) {
      throw new Error("Missing required parameter: path");
    }

    const { databases } = await createAdminClient();

    if (!databases) {
      throw new Error("Failed to create Appwrite client");
    }

    console.log("Updating file users:", { fileId, emails, path });
    
    const updatedFile = await databases.updateDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
      {
        users: emails,
      },
    );

    revalidatePath(path);
    return parseStringify(updatedFile);
  } catch (error) {
    console.error("Update file users error:", { fileId, emails, path, error });
    handleError(error, "Failed to update file users");
  }
};

export const deleteFile = async ({
  fileId,
  bucketFileId,
  path,
}: DeleteFileProps) => {
  try {
    // Validate required parameters
    if (!fileId) {
      throw new Error("Missing required parameter: fileId");
    }
    if (!bucketFileId) {
      throw new Error("Missing required parameter: bucketFileId");
    }
    if (!path) {
      throw new Error("Missing required parameter: path");
    }

    const { databases, storage } = await createAdminClient();

    if (!databases || !storage) {
      throw new Error("Failed to create Appwrite client");
    }

    console.log("Deleting file:", { fileId, bucketFileId, path });

    // First delete the document from the database
    const deletedFile = await databases.deleteDocument(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      fileId,
    );

    if (deletedFile) {
      // Then delete the file from storage
      try {
        await storage.deleteFile(appwriteConfig.bucketId, bucketFileId);
        console.log("File deleted from storage successfully");
      } catch (storageError) {
        console.error("Failed to delete file from storage:", storageError);
        // Don't throw here as the document was already deleted
      }
    }

    revalidatePath(path);
    return parseStringify({ status: "success" });
  } catch (error) {
    console.error("Delete file error:", { fileId, bucketFileId, path, error });
    handleError(error, "Failed to delete file");
  }
};

// ============================== TOTAL FILE SPACE USED
export async function getTotalSpaceUsed() {
  try {
    const { databases } = await createSessionClient();
    const currentUser = await getCurrentUser();
    if (!currentUser) throw new Error("User is not authenticated.");

    const files = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.filesCollectionId,
      [Query.equal("owner", [currentUser.$id])],
    );

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      documents: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024 /* 2GB available bucket storage */,
    };

    files.documents.forEach((file) => {
      const fileType = file.type as FileType;
      totalSpace[fileType].size += file.size;
      totalSpace.used += file.size;

      if (
        !totalSpace[fileType].latestDate ||
        new Date(file.$updatedAt) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = file.$updatedAt;
      }
    });

    return parseStringify(totalSpace);
  } catch (error) {
    handleError(error, "Error calculating total space used:, ");
  }
}
