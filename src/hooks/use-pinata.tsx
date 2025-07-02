import { useState } from "react";

const PINATA_API_KEY = import.meta.env.VITE_PINATA_API_KEY!
const PINATA_SECRET_API_KEY = import.meta.env.VITE_PINATA_API_SECRET;
const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
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
             const headers: Record<string, string> = {};
            if (PINATA_JWT) {
                headers["Authorization"] = `Bearer ${PINATA_JWT}`;
            } else if (PINATA_API_KEY && PINATA_SECRET_API_KEY) {
                headers["pinata_api_key"] = PINATA_API_KEY;
                headers["pinata_secret_api_key"] = PINATA_SECRET_API_KEY;
            } else {
                throw new Error("Pinata credentials are not set.");
            }
            const res = await fetch(PINATA_ENDPOINT, {
                method: "POST",
                headers,
                body: formData,
            });

            if (!res.ok) {
                throw new Error(`Upload failed: ${res.statusText}`);
            }

            const data = await res.json();
            setIpfsHash(data.IpfsHash);
            const url = `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
            console.log(url);
           // setError(null);
            return data.IpfsHash;
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            setError(errorMessage);
            return null;
        } finally {
            setUploading(false);
        }
    };

    return { uploading, error, ipfsHash, uploadFile };
}