import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, QrCode } from 'lucide-react';

interface QRCodeGeneratorProps {
  url: string;
  title?: string;
  description?: string;
}

export function QRCodeGenerator({ url, title = "Scan for Menu", description = "Scan this QR code to access the menu on your device" }: QRCodeGeneratorProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const qrCodeInstance = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!qrRef.current) return;

    qrCodeInstance.current = new QRCodeStyling({
      width: 200,
      height: 200,
      data: url,
      dotsOptions: {
        color: "hsl(var(--primary))",
        type: "rounded"
      },
      backgroundOptions: {
        color: "hsl(var(--background))",
      },
      cornersSquareOptions: {
        color: "hsl(var(--primary))",
        type: "extra-rounded"
      },
      cornersDotOptions: {
        color: "hsl(var(--primary))",
        type: "dot"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10
      }
    });

    qrCodeInstance.current.append(qrRef.current);

    return () => {
      if (qrRef.current) {
        qrRef.current.innerHTML = '';
      }
    };
  }, [url]);

  const downloadQR = () => {
    if (qrCodeInstance.current) {
      qrCodeInstance.current.download({
        name: "menu-qr-code",
        extension: "png"
      });
    }
  };

  return (
    <Card className="w-full max-w-sm mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <QrCode className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div ref={qrRef} className="border-2 border-border rounded-lg p-2" />
        </div>
        <Button onClick={downloadQR} variant="outline" className="w-full">
          <Download className="h-4 w-4 mr-2" />
          Download QR Code
        </Button>
      </CardContent>
    </Card>
  );
}