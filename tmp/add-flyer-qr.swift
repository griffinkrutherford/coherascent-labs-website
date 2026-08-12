import AppKit
import CoreImage
import Foundation

guard CommandLine.arguments.count == 3 else {
    fputs("usage: add-flyer-qr.swift input.png output.png\n", stderr)
    exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
let destination = "https://lunesynth.com/beta-offer"

guard let source = NSImage(contentsOf: inputURL),
      let sourceRepresentation = source.representations.first else {
    fputs("could not read input image\n", stderr)
    exit(3)
}

let width = sourceRepresentation.pixelsWide
let height = sourceRepresentation.pixelsHigh
guard width == 1080, height == 1350 else {
    fputs("expected a 1080x1350 flyer\n", stderr)
    exit(4)
}

guard let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: width,
    pixelsHigh: height,
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
) else {
    fputs("could not create output canvas\n", stderr)
    exit(5)
}

NSGraphicsContext.saveGraphicsState()
guard let graphicsContext = NSGraphicsContext(bitmapImageRep: bitmap) else {
    fputs("could not create graphics context\n", stderr)
    exit(6)
}
NSGraphicsContext.current = graphicsContext
graphicsContext.imageInterpolation = .high
source.draw(in: NSRect(x: 0, y: 0, width: width, height: height))

// Give the brand name more visual weight while preserving the original icon.
// The soft backing quiets the smaller rasterized wordmark underneath without
// introducing a hard-edged banner over the varied flyer artwork.
let usesLowMasthead = inputURL.lastPathComponent.hasPrefix("38-")
let mastheadY: CGFloat = usesLowMasthead ? 1104 : 1144
let mastheadBacking = NSRect(x: 292, y: mastheadY - 16, width: 496, height: 74)
let backingGradient = NSGradient(colorsAndLocations:
    (NSColor(calibratedWhite: 0, alpha: 0), 0),
    (NSColor(calibratedWhite: 0, alpha: 0.98), 0.18),
    (NSColor(calibratedWhite: 0, alpha: 0.98), 0.82),
    (NSColor(calibratedWhite: 0, alpha: 0), 1)
)
backingGradient?.draw(in: mastheadBacking, angle: 0)

let mastheadStyle = NSMutableParagraphStyle()
mastheadStyle.alignment = .center
let luneAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 34, weight: .medium),
    .foregroundColor: NSColor(calibratedRed: 1, green: 0.45, blue: 0.82, alpha: 1),
    .kern: 8.5,
]
let synthAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 34, weight: .medium),
    .foregroundColor: NSColor(calibratedRed: 0.05, green: 0.94, blue: 0.95, alpha: 1),
    .kern: 8.5,
]
let masthead = NSMutableAttributedString(string: "LUNE ", attributes: luneAttributes)
masthead.append(NSAttributedString(string: "SYNTH", attributes: synthAttributes))
masthead.addAttribute(.paragraphStyle, value: mastheadStyle, range: NSRange(location: 0, length: masthead.length))
masthead.draw(in: NSRect(x: 250, y: mastheadY, width: 580, height: 48))

let card = NSRect(x: 794, y: 24, width: 256, height: 268)
NSColor(calibratedWhite: 1, alpha: 0.98).setFill()
NSBezierPath(roundedRect: card, xRadius: 22, yRadius: 22).fill()

let labelStyle = NSMutableParagraphStyle()
labelStyle.alignment = .center
let labelAttributes: [NSAttributedString.Key: Any] = [
    .font: NSFont.systemFont(ofSize: 21, weight: .bold),
    .foregroundColor: NSColor(calibratedWhite: 0.08, alpha: 1),
    .kern: 0.7,
    .paragraphStyle: labelStyle,
]
NSString(string: "SCAN FOR BETA").draw(
    in: NSRect(x: card.minX + 8, y: card.minY + 15, width: card.width - 16, height: 28),
    withAttributes: labelAttributes
)

guard let filter = CIFilter(name: "CIQRCodeGenerator") else {
    fputs("QR generator unavailable\n", stderr)
    exit(7)
}
filter.setValue(Data(destination.utf8), forKey: "inputMessage")
filter.setValue("H", forKey: "inputCorrectionLevel")
guard let qr = filter.outputImage else {
    fputs("could not generate QR code\n", stderr)
    exit(8)
}

let availableQRSize: CGFloat = 218
let scale = floor(availableQRSize / qr.extent.width)
let scaledQR = qr.transformed(by: CGAffineTransform(scaleX: scale, y: scale))
let context = CIContext(options: [.useSoftwareRenderer: false])
guard let qrCG = context.createCGImage(scaledQR, from: scaledQR.extent) else {
    fputs("could not render QR code\n", stderr)
    exit(9)
}

let qrImage = NSImage(cgImage: qrCG, size: scaledQR.extent.size)
let qrRect = NSRect(
    x: card.midX - scaledQR.extent.width / 2,
    y: card.maxY - 15 - scaledQR.extent.height,
    width: scaledQR.extent.width,
    height: scaledQR.extent.height
)
graphicsContext.imageInterpolation = .none
qrImage.draw(in: qrRect)
graphicsContext.flushGraphics()
NSGraphicsContext.restoreGraphicsState()

guard let png = bitmap.representation(using: .png, properties: [:]) else {
    fputs("could not encode output PNG\n", stderr)
    exit(10)
}

try png.write(to: outputURL, options: .atomic)
