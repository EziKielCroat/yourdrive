interface VERTConfig {
  enabled: boolean;
  url: string;
  isSelfHosted: boolean;
}

export const getVERTConfig = (): VERTConfig => {
  const vertUrl = process.env.VERT_URL;

  if (vertUrl) {
    return {
      enabled: true,
      url: vertUrl,
      isSelfHosted: true,
    };
  }

  if (vertUrl) {
    return {
      enabled: true,
      url: vertUrl,
      isSelfHosted: true,
    };
  }

  console.log("Using public VERT instance (vert.sh)");
  return {
    enabled: true,
    url: "https://vert.sh",
    isSelfHosted: false,
  };
};
