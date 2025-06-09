"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

function UploadBookForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isBrowser, setIsBrowser] = useState(false);
  
  // File state tracking
  const [pdfFile, setPdfFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  // Set isBrowser to true once component is mounted
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  const form = useForm({
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      count: "",
      summary: "",
    },
  });

  const { handleSubmit, formState, setError, control } = form;
  const { errors } = formState;

  const validateFileSize = (file, maxSizeMB, fieldName) => {
    if (!file) return true;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setError(fieldName, {
        type: "manual",
        message: `File is too large. Maximum size is ${maxSizeMB}MB.`,
      });
      return false;
    }
    return true;
  };

  const validateForm = (values) => {
    let isValid = true;
    setErrorMessage("");

    if (!values.title || values.title.trim().length < 3) {
      setError("title", { type: "manual", message: "Title must be at least 3 characters" });
      isValid = false;
    }

    if (!values.author || values.author.trim().length < 3) {
      setError("author", { type: "manual", message: "Author name must be at least 3 characters" });
      isValid = false;
    }

    if (!values.count || isNaN(parseInt(values.count)) || parseInt(values.count) < 1) {
      setError("count", { type: "manual", message: "Count must be at least 1" });
      isValid = false;
    }

    if (!values.summary || values.summary.trim().length < 10) {
      setError("summary", { type: "manual", message: "Summary must be at least 10 characters" });
      isValid = false;
    }

    // Check for file existence and size
    if (!pdfFile) {
      setError("uploadPDF", { type: "manual", message: "PDF file is required" });
      isValid = false;
    } else if (!validateFileSize(pdfFile, 10, "uploadPDF")) {
      isValid = false;
    }

    if (thumbnailFile && !validateFileSize(thumbnailFile, 5, "uploadThumbnail")) {
      isValid = false;
    }

    if (videoFile && !validateFileSize(videoFile, 10, "uploadVideo")) {
      isValid = false;
    }

    return isValid;
  };

  const handleFileChange = (e, setFile, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    } else {
      setFile(null);
      if (fieldName === 'uploadPDF') {
        setError(fieldName, { type: "manual", message: "PDF file is required" });
      }
    }
  };

  const onSubmit = async (values) => {
    if (!validateForm(values)) return;
    if (!isBrowser) return;

    setIsSubmitting(true);
    setErrorMessage("");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("title", values.title.trim());
    formData.append("author", values.author.trim());
    if (values.genre) formData.append("genre", values.genre.trim());
    formData.append("count", values.count);
    formData.append("summary", values.summary.trim());

    // Append files
    if (pdfFile) {
      formData.append("uploadPDF", pdfFile);
    }

    if (thumbnailFile) {
      formData.append("uploadThumbnail", thumbnailFile);
    }

    if (videoFile) {
      formData.append("uploadVideo", videoFile);
    }

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const uploadPromise = new Promise((resolve, reject) => {
        xhr.open("POST", "http://localhost:4000/book/createbook");

        xhr.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch (e) {
              reject(new Error("Invalid JSON response"));
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error || `Server error: ${xhr.status}`));
            } catch (e) {
              reject(new Error(`HTTP error: ${xhr.status}`));
            }
          }
        };

        xhr.onerror = function () {
          reject(new Error("Network error occurred"));
        };

        xhr.send(formData);
      });

      const json = await uploadPromise;

      if (json.success) {
        alert("Book uploaded successfully!");
        navigate("/dashboard");
      } else {
        setErrorMessage(json.error || "Upload failed");
        console.error("Server error:", json);
      }
    } catch (err) {
      console.error("Upload Error:", err.message);
      setErrorMessage("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (!isBrowser) {
    return null; // Return null on server-side to prevent rendering before hydration
  }

  return (
    <section className="flex flex-col items-center p-8 max-w-2xl mx-auto bg-[#0d0f17]/90 text-white rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">📘 Upload New Book</h2>

      {errorMessage && (
        <div className="w-full p-3 mb-4 bg-red-600/30 border border-red-500 rounded-md text-white">
          {errorMessage}
        </div>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data" className="w-full space-y-4">
          {/* Title */}
          <FormField
            control={control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter book title"
                    {...field}
                    className="bg-[#1e2230] border border-[#2c2f45]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Author */}
          <FormField
            control={control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter author's name"
                    {...field}
                    className="bg-[#1e2230] border border-[#2c2f45]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Genre */}
          <FormField
            control={control}
            name="genre"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Genre</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Fiction, Science"
                    {...field}
                    className="bg-[#1e2230] border border-[#2c2f45]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Count */}
          <FormField
            control={control}
            name="count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Count</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    className="bg-[#1e2230] border border-[#2c2f45]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Summary */}
          <FormField
            control={control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a short summary of the book..."
                    {...field}
                    className="bg-[#1e2230] border border-[#2c2f45]"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Upload PDF */}
          <div className="space-y-2">
            <FormLabel htmlFor="uploadPDF">Upload PDF (Required, Max 10MB)</FormLabel>
            <Input
              id="uploadPDF"
              type="file"
              accept="application/pdf"
              onChange={(e) => handleFileChange(e, setPdfFile, "uploadPDF")}
              className="bg-[#1e2230] border border-[#2c2f45]"
            />
            {pdfFile && <p className="text-xs text-green-400 mt-1">Selected: {pdfFile.name}</p>}
            {errors.uploadPDF && <p className="text-sm text-red-500">{errors.uploadPDF.message}</p>}
          </div>

          {/* Upload Thumbnail */}
          <div className="space-y-2">
            <FormLabel htmlFor="uploadThumbnail">Upload Thumbnail (Optional, Max 5MB)</FormLabel>
            <Input
              id="uploadThumbnail"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setThumbnailFile, "uploadThumbnail")}
              className="bg-[#1e2230] border border-[#2c2f45]"
            />
            {thumbnailFile && <p className="text-xs text-green-400 mt-1">Selected: {thumbnailFile.name}</p>}
            {errors.uploadThumbnail && <p className="text-sm text-red-500">{errors.uploadThumbnail.message}</p>}
          </div>

          {/* Upload Video */}
          <div className="space-y-2">
            <FormLabel htmlFor="uploadVideo">Upload Video (Optional, Max 10MB)</FormLabel>
            <Input
              id="uploadVideo"
              type="file"
              accept="video/*"
              onChange={(e) => handleFileChange(e, setVideoFile, "uploadVideo")}
              className="bg-[#1e2230] border border-[#2c2f45]"
            />
            {videoFile && <p className="text-xs text-green-400 mt-1">Selected: {videoFile.name}</p>}
            {errors.uploadVideo && <p className="text-sm text-red-500">{errors.uploadVideo.message}</p>}
          </div>

          {/* Progress Bar */}
          {isSubmitting && uploadProgress > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
              <p className="text-xs text-center mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-[#f5c784] text-black hover:bg-[#f1b65f]"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading..." : "Upload Book"}
          </Button>
        </form>
      </Form>
    </section>
  );
}

export default UploadBookForm;