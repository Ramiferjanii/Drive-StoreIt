"use client"

import React, {useCallback, useState} from 'react'
import {useDropzone} from 'react-dropzone'
import {cn, getFileType} from '@/lib/utils' 
import Image from 'next/image' 
import { set } from 'zod'
import Thumbnail from './Thumbnail'
import { convertFileToUrl } from '@/lib/utils'




interface Props {
  ownerId: string; 
  accountId: string;
  className?: string; 
}




const FileUploader = ({ ownerId , accountId , className }) => {
  const [files , setFiles] = useState<File[]>([])
  const handleRemoveFile =(e: React.MouseEvent<HTMLImageElement , MouseEvent> , fileName: string) => {
    e.stopPropagation()
    setFiles((prev) => prev.filter((file) => file.name !== fileName))
  }

  const onDrop = useCallback(async (acceptedFiles  : File[]) => {
    setFiles(acceptedFiles) 
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})

  return (
    <div {...getRootProps()} className='cursor-pointer' >
      <input {...getInputProps()}  />
      <button type='button' className={cn('uploader-button')} > <Image src="/assets/icons/upload.svg" alt="Upload" width={24} height={24}  /> <p>Upload</p> </button>
      {files.length > 0 && <ul className='uploader-preview-list' >
        <h4 className='h4 text-light-100'  >
          Uploaded Files
        </h4>
        {files.map((file , index ) => {
          const {type , extension } = getFileType(file.name)

          return <li key={`${file.name}-${index}`} className='uploader-preview-item' >
            <div className='flex items-center' >
            <Thumbnail type={type} extension={extension} url={convertFileToUrl(file)} /> 
            <div className='preview-item-name' >
              <p className='preview-item-name-text' >{file.name}</p>
              <Image src="/assets/icons/file-loader.gif" width={80} height={26} alt='loader'   unoptimized
 />

            </div>
            </div>
            <Image src="/assets/icons/remove.svg" width={24} height={24} alt='remove'   unoptimized
            onClick={(e)=> handleRemoveFile(e , file.name)}/>
          </li>
        })}

      </ul>
        }

      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}


export default FileUploader