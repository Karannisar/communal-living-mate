
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PhotoUploadProps {
  onUpload: (urls: string[]) => void;
  existingPhotos?: string[];
}

export const PhotoUpload = ({ onUpload, existingPhotos = [] }: PhotoUploadProps) => {
  const [uploading, setUploading] = useState(false);

  const uploadPhotos = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("Please select images to upload.");
      }

      const files = Array.from(event.target.files);
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const filename = `${Math.random()}.${fileExt}`;
        const filePath = `${filename}`;

        const { error: uploadError, data } = await supabase.storage
          .from('hostel-photos')
          .upload(filePath, file);

        if (uploadError) {
          throw uploadError;
        }

        return `https://kbqqepdhtfhrcfmomzhe.supabase.co/storage/v1/object/public/hostel-photos/${filePath}`;
      });

      const urls = await Promise.all(uploadPromises);
      onUpload(urls);
      toast.success("Photos uploaded successfully!");
    } catch (error: any) {
      toast.error(error.message || "Error uploading photos");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async (url: string) => {
    const updatedPhotos = existingPhotos.filter(photo => photo !== url);
    onUpload(updatedPhotos);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          className="w-full"
          onClick={() => document.getElementById('photo-upload')?.click()}
        >
          {uploading ? (
            "Uploading..."
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload Photos
            </>
          )}
        </Button>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={uploadPhotos}
          className="hidden"
        />
      </div>

      {existingPhotos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {existingPhotos.map((url, index) => (
            <div key={index} className="relative group">
              <img
                src={url}
                alt={`Hostel photo ${index + 1}`}
                className="w-full h-32 object-cover rounded-md"
              />
              <button
                onClick={() => removePhoto(url)}
                className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
