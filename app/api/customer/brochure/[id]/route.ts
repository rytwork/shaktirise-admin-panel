import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {

    try {

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                { message: "Customer ID is required" },
                { status: 400 }
            );
        }

        /* Fetch customer */
        const customerRef = doc(db, "customers", id);
        const customerDoc = await getDoc(customerRef);

        if (!customerDoc.exists()) {
            return NextResponse.json(
                { message: "Customer not found" },
                { status: 404 }
            );
        }

        const data: any = customerDoc.data();


        /* Create PDF */
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

        /* Border */
        page.drawRectangle({
            x: 20,
            y: 20,
            width: 560,
            height: 760,
            borderWidth: 2,
            borderColor: rgb(0.5, 0, 0.5)
        });

        /* Logo */
        const logoPath = path.join(process.cwd(), "public/logo.png");

        if (fs.existsSync(logoPath)) {

            const logoBytes = fs.readFileSync(logoPath);
            const logoImage = await pdfDoc.embedPng(logoBytes);

            page.drawImage(logoImage, {
                x: 260,
                y: 700,
                width: 70,
                height: 70
            });

        }

        /* Title */
        page.drawText("Shakti Rise Admission Brochure", {
            x: 110,
            y: 660,
            size: 20,
            font: boldFont
        });

        /* Customer Photo */
        if (data.photoUrl) {

            try {

                const photoBytes = await fetch(data.photoUrl).then(res => res.arrayBuffer());
                const photoImage = await pdfDoc.embedJpg(photoBytes);

                // Draw border
                page.drawRectangle({
                    x: 428,
                    y: 598,
                    width: 124,
                    height: 124,
                    borderColor: rgb(1, 0.2, 0.6), // pink
                    borderWidth: 3
                });

                // Draw image
                page.drawImage(photoImage, {
                    x: 430,
                    y: 600,
                    width: 120,
                    height: 120
                });

            } catch (err) {
                console.log("Photo load error");
            }

        }

        /* Customer Details */

        page.drawText(`Student Name: ${data.name || "-"}`, {
            x: 60,
            y: 600,
            size: 14,
            font: normalFont
        });



        page.drawText(`Phone: ${data.phone || "-"}`, {
            x: 60,
            y: 570,
            size: 14,
            font: normalFont
        });

        page.drawText(`Gender: ${data.gender || "-"}`, {
            x: 60,
            y: 540,
            size: 14,
            font: normalFont
        });

        page.drawText(`Agent code: ${data.createdByAgent || "-"}`, {
            x: 60,
            y: 510,
            size: 14,
            font: normalFont
        });

        page.drawText(`Verification Code: ${data.verificationCode}`, {
            x: 60,
            y: 480,
            size: 14,
            font: normalFont
        });

        page.drawText(`Admission Date: ${data.addmissionDate ? new Date(data.addmissionDate.seconds * 1000).toLocaleDateString() : "-"}`, {
            x: 60,
            y: 450,
            size: 14,
            font: normalFont
        });

        /* QR Code */

        const qrData = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?code=${data.verificationCode}`;

        const qrImage = await QRCode.toDataURL(qrData);
        const qrBytes = Buffer.from(qrImage.split(",")[1], "base64");
        const qrEmbed = await pdfDoc.embedPng(qrBytes);

        page.drawImage(qrEmbed, {
            x: 420,
            y: 440,
            width: 120,
            height: 120
        });

        page.drawText("Scan to Verify", {
            x: 440,
            y: 420,
            size: 10,
            font: normalFont
        });

        /* Digital Signature */

        if (data.agentSignature) {

            try {

                const signBytes = await fetch(data.agentSignature).then(res => res.arrayBuffer());
                const signImg = await pdfDoc.embedPng(signBytes);

                page.drawImage(signImg, {
                    x: 220,
                    y: 330,
                    width: 120,
                    height: 40
                });

            } catch (err) {
                console.log("Signature error");
            }

        }

        /* Signature boxes */

        page.drawText("Customer Signature:", {
            x: 60,
            y: 350,
            size: 14,
            font: normalFont
        });

        page.drawLine({
            start: { x: 200, y: 350 },
            end: { x: 400, y: 350 }
        });

        page.drawText("Agent Signature:", {
            x: 60,
            y: 300,
            size: 14,
            font: normalFont
        });

        page.drawLine({
            start: { x: 200, y: 300 },
            end: { x: 400, y: 300 }
        });

        /* Watermark */

        page.drawText("VERIFIED", {
            x: 180,
            y: 400,
            size: 60,
            font: boldFont,
            opacity: 0.1
        });

        /* Footer */

        page.drawText("Shakti Rise Admission Brochure", {
            x: 220,
            y: 50,
            size: 12,
            font: normalFont
        });

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=admission-${id}.pdf`
            }
        });

    } catch (error: any) {

        return NextResponse.json(
            { message: error.message || "Failed to generate brochure" },
            { status: 500 }
        );

    }

}