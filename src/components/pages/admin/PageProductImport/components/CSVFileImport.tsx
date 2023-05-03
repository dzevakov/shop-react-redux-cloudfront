import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from "axios";
import { Buffer } from "buffer";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File | undefined>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const encodeUserData = (data: string | null) => {
    if (data) {
      const userData = JSON.parse(data);

      const encodedAuthData = Buffer.from(
        `${userData?.user}:${userData?.pw}`
      ).toString("base64");

      return {
        authorization: `Basic ${encodedAuthData}`,
      };
    }

    return undefined;
  };

  const uploadFile = async () => {
    if (file?.name) {
      console.log("uploadFile to", url);

      const userData = localStorage.getItem("auth");

      const encodedAuthData = encodeUserData(userData);

      // Get the presigned URL
      const response = await axios({
        method: "GET",
        url,
        headers: encodedAuthData,
        params: {
          name: encodeURIComponent(file.name),
        },
      });
      console.log("File to upload: ", file.name);
      console.log("Uploading to: ", response.data.url);

      const result = await fetch(response.data.url, {
        method: "PUT",
        body: file,
      });
      console.log("Result: ", result);

      setFile(undefined);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
