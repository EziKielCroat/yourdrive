import axios from "axios";

interface VERTConfig {
  url: string;
  isSelfHosted: boolean;
}

interface ConversionFormat {
  extension: string;
  label: string;
}

class ConversionService {
  private config: VERTConfig | null = null;

  async getConfig(accessToken: string): Promise<VERTConfig> {
    if (this.config) return this.config;

    const response = await axios.get("/api/conversion/config", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    this.config = response.data.config;
    return this.config!;
  }

  async getSupportedFormats(
    mimeType: string,
    accessToken: string,
  ): Promise<ConversionFormat[]> {
    const response = await axios.get(
      `/api/conversion/formats/${encodeURIComponent(mimeType)}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      },
    );

    return response.data.formats.map((ext: string) => ({
      extension: ext,
      label: ext.toUpperCase(),
    }));
  }

  async prepareFile(fileId: string, accessToken: string) {
    const response = await axios.post(
      `/api/conversion/prepare/${fileId}`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data;
  }

  async openVERTConversion(
    fileId: string,
    fileName: string,
    targetFormat: string,
    accessToken: string,
  ) {
    const config = await this.getConfig(accessToken);
    const fileData = await this.prepareFile(fileId, accessToken);

    const vertUrl = new URL(config.url);
    vertUrl.searchParams.set("file", fileData.downloadUrl);
    vertUrl.searchParams.set("filename", fileName);
    vertUrl.searchParams.set("target", targetFormat);
    vertUrl.searchParams.set(
      "callback",
      `${window.location.origin}/conversion-callback`,
    );

    const width = 1200;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      vertUrl.toString(),
      "vert-conversion",
      `width=${width},height=${height},left=${left},top=${top}`,
    );
  }

  async saveConvertedFile(
    originalFileId: string,
    convertedFileUrl: string,
    newFormat: string,
    fileName: string,
    accessToken: string,
  ) {
    const response = await axios.post(
      "/api/conversion/save",
      {
        originalFileId,
        convertedFileUrl,
        newFormat,
        fileName,
      },
      { headers: { Authorization: `Bearer ${accessToken}` } },
    );

    return response.data;
  }
}

export const conversionService = new ConversionService();
