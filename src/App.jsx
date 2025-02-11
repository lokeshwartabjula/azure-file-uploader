import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { BlobServiceClient } from '@azure/storage-blob'
import viteLogo from '/vite.svg'
import reactLogo from './assets/react.svg'
import './App.css'

function App() {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [sasUrl, setSasUrl] = useState('')
  const [containerName, setContainerName] = useState("");


  const onDrop = (acceptedFiles) => {
    setFiles(acceptedFiles)
  }

  const uploadFiles = async () => {
    if (!sasUrl) {
      alert('SAS URL is missing. Please enter a valid URL.');
      return;
    }

    setUploading(true);
    const blobServiceClient = new BlobServiceClient(sasUrl);

    try {
      for (const file of files) {
        const containerClient = blobServiceClient.getContainerClient(containerName);
        const blockBlobClient = containerClient.getBlockBlobClient(file.name);
        
        console.log(`Uploading: ${file.name}`);
        await blockBlobClient.uploadBrowserData(file, {
          blockSize: file.size,
          concurrency: 3,
        });
        console.log(`${file.name} uploaded successfully`);
      }
      alert('All files uploaded successfully!');
      setFiles([]);
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Check console for details.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Azure Blob File Uploader</h1>
      <div className="card">
        <input
          type="text"
          placeholder="Enter SAS URL"
          value={sasUrl}
          onChange={(e) => setSasUrl(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <input
          type="text"
          placeholder="Enter your container name"
          value={containerName}
          onChange={(e) => setContainerName(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
        />
        <Dropzone onDrop={onDrop} files={files} />
        <button onClick={uploadFiles} disabled={uploading || files.length === 0}>
          {uploading ? 'Uploading...' : 'Upload Files'}
        </button>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </>
  )
}

const Dropzone = ({ onDrop, files }) => {
  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()} className="dropzone">
      <input {...getInputProps()} />
      <p>Drag & drop files here, or click to select files</p>
      <ul>
        {files.map((file) => (
          <li key={file.name}>{file.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App
