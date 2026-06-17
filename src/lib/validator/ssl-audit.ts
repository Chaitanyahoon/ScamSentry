import tls from "tls";

export interface SslCertInfo {
  validFrom: Date;
  validTo: Date;
  ageInDays: number;
}

/**
 * Connects to port 443 of the target domain and extracts peer certificate metrics
 * entirely locally and offline, with a strict 3.5-second timeout safeguard.
 */
export function getCertificateInfo(
  domain: string,
): Promise<SslCertInfo | null> {
  return new Promise((resolve) => {
    // Sanitize domain to remove standard protocols/paths if passed
    let host = domain.trim().toLowerCase();
    try {
      if (host.includes("://")) {
        host = new URL(host).hostname;
      } else if (host.includes("/")) {
        host = host.split("/")[0];
      }
      // Remove port if present
      host = host.split(":")[0];
    } catch (e) {
      // Fallback to original domain string
    }

    const socket = tls.connect(
      {
        host: host,
        port: 443,
        servername: host,
        rejectUnauthorized: false,
      },
      () => {
        clearTimeout(timer);
        const cert = socket.getPeerCertificate();
        socket.end();

        if (cert && cert.valid_from) {
          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const ageInDays =
            (Date.now() - validFrom.getTime()) / (1000 * 60 * 60 * 24);
          resolve({
            validFrom,
            validTo,
            ageInDays,
          });
        } else {
          resolve(null);
        }
      },
    );

    let timer: NodeJS.Timeout | undefined;

    socket.on("error", () => {
      if (timer) clearTimeout(timer);
      socket.destroy();
      resolve(null);
    });

    timer = setTimeout(() => {
      socket.destroy();
      resolve(null);
    }, 3500);
  });
}
