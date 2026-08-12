import AppKit
import CoreImage
import Foundation

guard CommandLine.arguments.count == 3 else {
    fputs("usage: reframe-flyers input.png output.png\n", stderr)
    exit(2)
}

let inputURL = URL(fileURLWithPath: CommandLine.arguments[1])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[2])
guard let source = CIImage(contentsOf: inputURL) else {
    fputs("could not read input\n", stderr)
    exit(3)
}

let canvasWidth: CGFloat = 1080
let canvasHeight: CGFloat = 1350
let canvas = CGRect(x: 0, y: 0, width: canvasWidth, height: canvasHeight)
let sourceWidth = source.extent.width
let sourceHeight = source.extent.height

// Fill the extra canvas with a softly extended, darkened version of the actual
// artwork so every export feels intentionally art-directed rather than boxed in.
let fillScale = max(canvasWidth / sourceWidth, canvasHeight / sourceHeight)
let filledWidth = sourceWidth * fillScale
let filledHeight = sourceHeight * fillScale
let fillX = (canvasWidth - filledWidth) / 2
let fillY = (canvasHeight - filledHeight) / 2
let filled = source
    .transformed(by: CGAffineTransform(scaleX: fillScale, y: fillScale))
    .transformed(by: CGAffineTransform(translationX: fillX, y: fillY))
    .clampedToExtent()
    .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 34])
    .applyingFilter("CIColorControls", parameters: [
        kCIInputBrightnessKey: -0.12,
        kCIInputSaturationKey: 0.72,
        kCIInputContrastKey: 0.94,
    ])
    .cropped(to: canvas)
let opaqueBase = CIImage(color: CIColor(red: 0.008, green: 0.012, blue: 0.035, alpha: 1))
    .cropped(to: canvas)
let opaqueFilled = filled.composited(over: opaqueBase).cropped(to: canvas)

// Keep the original flyer untouched and proportional, with a modest safe zone
// for feed UIs. Never crop headlines, devices, CTA buttons, or offer copy.
let safeWidth: CGFloat = 1032
let safeHeight: CGFloat = 1302
let fitScale = min(safeWidth / sourceWidth, safeHeight / sourceHeight)
let fittedWidth = sourceWidth * fitScale
let fittedHeight = sourceHeight * fitScale
let fitX = (canvasWidth - fittedWidth) / 2
let fitY = (canvasHeight - fittedHeight) / 2
let foreground = source
    .transformed(by: CGAffineTransform(scaleX: fitScale, y: fitScale))
    .transformed(by: CGAffineTransform(translationX: fitX, y: fitY))

let foregroundRect = CGRect(x: fitX, y: fitY, width: fittedWidth, height: fittedHeight)
let edgeMask = CIFilter(
    name: "CIRoundedRectangleGenerator",
    parameters: [
        "inputExtent": CIVector(cgRect: foregroundRect),
        "inputRadius": 8,
        "inputColor": CIColor.white,
    ]
)!.outputImage!
    .clampedToExtent()
    .applyingFilter("CIGaussianBlur", parameters: [kCIInputRadiusKey: 36])
    .cropped(to: canvas)
let composed = foreground
    .applyingFilter("CIBlendWithMask", parameters: [
        kCIInputBackgroundImageKey: opaqueFilled,
        kCIInputMaskImageKey: edgeMask,
    ])
    .composited(over: opaqueBase)
    .cropped(to: canvas)
let context = CIContext(options: [
    .workingColorSpace: CGColorSpace(name: CGColorSpace.sRGB)!,
    .outputColorSpace: CGColorSpace(name: CGColorSpace.sRGB)!,
])
guard let cgImage = context.createCGImage(composed, from: canvas) else {
    fputs("could not render output\n", stderr)
    exit(4)
}

let bitmap = NSBitmapImageRep(cgImage: cgImage)
guard let png = bitmap.representation(using: .png, properties: [:]) else {
    fputs("could not encode output\n", stderr)
    exit(5)
}
try png.write(to: outputURL, options: .atomic)
