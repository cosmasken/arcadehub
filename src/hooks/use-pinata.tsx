import { useState } from "react";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY!;
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_API_SECRET!;
const PINATA_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

export function usePinata() {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [ipfsHash, setIpfsHash] = useState<string | null>(null);

    const uploadFile = async (file: File) => {
        setUploading(true);
        setError(null);
        setIpfsHash(null);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await fetch(PINATA_ENDPOINT, {
                method: "POST",
                headers: {
                    pinata_api_key: PINATA_API_KEY,
                    pinata_secret_api_key: PINATA_SECRET_API_KEY,
                },
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Upload failed: ${res.statusText}`);
            }

            const data = await res.json();
            setIpfsHash(data.IpfsHash);
            return data.IpfsHash;
        } catch (err: any) {
            setError(err.message || "Unknown error");
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploading, error, ipfsHash, uploadFile };
}