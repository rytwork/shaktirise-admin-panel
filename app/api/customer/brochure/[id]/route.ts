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
            borderColor: rgb(0.5, 0, 0.5),
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
                height: 70,
            });
        }

        /* Title */
        page.drawText("Shakti Rise Admission Brochure", {
            x: 110,
            y: 660,
            size: 20,
            font: boldFont,
        });

        /* Customer Photo */
        if (data.photoUrl) {
            try {
                const photoBytes = await fetch(data.photoUrl).then((res) =>
                    res.arrayBuffer()
                );
                const photoImage = await pdfDoc.embedJpg(photoBytes);

                page.drawRectangle({
                    x: 428,
                    y: 598,
                    width: 124,
                    height: 124,
                    borderColor: rgb(1, 0.2, 0.6),
                    borderWidth: 3,
                });

                page.drawImage(photoImage, {
                    x: 430,
                    y: 600,
                    width: 120,
                    height: 120,
                });
            } catch (err) {
                console.log("Photo load error");
            }
        }

        /* ================= CUSTOMER DETAILS ================= */

        let y = 600;

        const drawLine = (label: string, value: any) => {
            page.drawText(`${label}: ${value || "-"}`, {
                x: 60,
                y,
                size: 14,
                font: normalFont,
            });
            y -= 30;
        };

        drawLine("Student Name", data.name);
        drawLine("Aadhar Number", data.adharNumber);
        drawLine(
            "Date of Birth",
            data.dob
                ? new Date(data.dob).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : "-"
        );

        drawLine("Phone", data.phone);
        drawLine("Gender", data.gender);
        drawLine("Agent Code", data.createdByAgent);
        drawLine("Verification Code", data.verificationCode);

        drawLine(
            "Admission Date",
            data.addmissionDate
                ? new Date(data.addmissionDate.seconds * 1000).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })
                : "-"
        );

        /// ===== NEW FIELDS =====
        drawLine("Education", data.higherEducation);
        drawLine("Bank Name", data.bankName);
        drawLine("Account Number", data.accountNumber);
        drawLine("IFSC Code", data.ifscCode);
        drawLine("Branch", data.branch);

        /* QR Code */
        const qrData = `${process.env.NEXT_PUBLIC_BASE_URL}/verify?code=${data.verificationCode}`;

        const qrImage = await QRCode.toDataURL(qrData);
        const qrBytes = Buffer.from(qrImage.split(",")[1], "base64");
        const qrEmbed = await pdfDoc.embedPng(qrBytes);

        page.drawImage(qrEmbed, {
            x: 420,
            y: 440,
            width: 120,
            height: 120,
        });

        page.drawText("Scan to Verify", {
            x: 440,
            y: 420,
            size: 10,
            font: normalFont,
        });

        /* Digital Signature */
        if (data.agentSignature) {
            try {
                const signBytes = await fetch(data.agentSignature).then((res) =>
                    res.arrayBuffer()
                );
                const signImg = await pdfDoc.embedPng(signBytes);

                page.drawImage(signImg, {
                    x: 220,
                    y: 250,
                    width: 120,
                    height: 40,
                });
            } catch (err) {
                console.log("Signature error");
            }
        }

        /* Signature Boxes */

        page.drawText("Customer Signature:", {
            x: 60,
            y: 210,
            size: 14,
            font: normalFont,
        });

        page.drawLine({
            start: { x: 200, y: 210 },
            end: { x: 400, y: 210 },
        });

        page.drawText("Agent Signature:", {
            x: 60,
            y: 190,
            size: 14,
            font: normalFont,
        });

        page.drawLine({
            start: { x: 200, y: 190 },
            end: { x: 400, y: 190 },
        });

        /* Watermark */
        page.drawText("VERIFIED", {
            x: 180,
            y: 300,
            size: 60,
            font: boldFont,
            opacity: 0.1,
        });

        /* Footer */
        page.drawText("Shakti Rise Admission Brochure", {
            x: 220,
            y: 50,
            size: 12,
            font: normalFont,
        });

        const pdfBytes = await pdfDoc.save();

        return new NextResponse(Buffer.from(pdfBytes), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename=admission-${id}.pdf`,
            },
        });
    } catch (error: any) {
        return NextResponse.json(
            { message: error.message || "Failed to generate brochure" },
            { status: 500 }
        );
    }
}