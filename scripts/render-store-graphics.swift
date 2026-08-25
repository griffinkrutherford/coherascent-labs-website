import AppKit

let root = "/Users/griffinrutherford/Documents/github-repos/coherascent-labs-website"
let playOutput = "\(root)/docs/store-assets/play-graphics"
let iosOutput = "\(root)/docs/store-assets/ios-graphics"

struct Shot {
    let source: String
    let name: String
    let caption: String
    let rotation: CGFloat
}

let sourceRoot = "\(root)/docs/store-assets/play-source-screenshots"
let shots = [
    Shot(source: "\(root)/mobile-app-assets/screenshots/applied/question-prompts/19-stats.png", name: "01-questions-from-your-material", caption: "Questions built from your material", rotation: -3.0),
    Shot(source: "\(sourceRoot)/choice-set.png", name: "02-practice-across-subjects", caption: "Practice across subjects", rotation: 2.6),
    Shot(source: "\(root)/mobile-app-assets/screenshots/applied/results/90-percent.png", name: "03-know-what-to-fix", caption: "Know what to fix", rotation: -2.5),
    Shot(source: "\(sourceRoot)/problem-solver-reasoning.png", name: "04-see-every-step", caption: "See every step", rotation: 2.8),
    Shot(source: "\(sourceRoot)/constellations.png", name: "05-your-subjects-mapped", caption: "Your subjects, mapped", rotation: -2.4),
    Shot(source: "\(sourceRoot)/leaderboard.png", name: "06-progress-in-one-place", caption: "Progress in one place", rotation: 2.5),
]

func load(_ path: String) -> NSImage {
    guard let image = NSImage(contentsOfFile: path) else { fatalError("Could not load \(path)") }
    return image
}

func canvas(width: Int, height: Int, draw: () -> Void) -> NSBitmapImageRep {
    guard let rep = NSBitmapImageRep(
        bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
        bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
        isPlanar: false, colorSpaceName: .deviceRGB,
        bytesPerRow: 0, bitsPerPixel: 0
    ) else { fatalError("Could not allocate canvas") }
    NSGraphicsContext.saveGraphicsState()
    NSGraphicsContext.current = NSGraphicsContext(bitmapImageRep: rep)
    NSColor.black.setFill()
    NSRect(x: 0, y: 0, width: width, height: height).fill()
    draw()
    NSGraphicsContext.restoreGraphicsState()
    return rep
}

func writeOpaquePNG(_ rep: NSBitmapImageRep, to path: String) {
    guard let source = rep.cgImage else { fatalError("Could not flatten \(path)") }
    let colorSpace = CGColorSpaceCreateDeviceRGB()
    guard let flattened = CGContext(
        data: nil, width: source.width, height: source.height,
        bitsPerComponent: 8, bytesPerRow: source.width * 4,
        space: colorSpace, bitmapInfo: CGImageAlphaInfo.noneSkipLast.rawValue
    ) else { fatalError("Could not create opaque context") }
    flattened.draw(source, in: CGRect(x: 0, y: 0, width: source.width, height: source.height))
    guard let image = flattened.makeImage() else { fatalError("Could not flatten image") }
    let opaqueRep = NSBitmapImageRep(cgImage: image)
    guard let data = opaqueRep.representation(using: .png, properties: [:]) else { fatalError("Could not encode \(path)") }
    try! data.write(to: URL(fileURLWithPath: path))
}

func drawCover(_ image: NSImage, in rect: NSRect) {
    let sourceRatio = image.size.width / image.size.height
    let targetRatio = rect.width / rect.height
    var source = NSRect(origin: .zero, size: image.size)
    if sourceRatio > targetRatio {
        let wantedWidth = image.size.height * targetRatio
        source.origin.x = (image.size.width - wantedWidth) / 2
        source.size.width = wantedWidth
    } else {
        let wantedHeight = image.size.width / targetRatio
        source.origin.y = (image.size.height - wantedHeight) / 2
        source.size.height = wantedHeight
    }
    image.draw(in: rect, from: source, operation: .copy, fraction: 1, respectFlipped: true, hints: [.interpolation: NSImageInterpolation.high])
}

func centeredText(_ text: String, y: CGFloat, width: CGFloat, size: CGFloat) {
    let style = NSMutableParagraphStyle()
    style.alignment = .center
    let attrs: [NSAttributedString.Key: Any] = [
        .font: NSFont(name: "Avenir Next Bold", size: size) ?? NSFont.systemFont(ofSize: size, weight: .bold),
        .foregroundColor: NSColor(calibratedWhite: 0.985, alpha: 1),
        .kern: 1.35,
        .paragraphStyle: style,
    ]
    NSString(string: text).draw(in: NSRect(x: 42, y: y, width: width - 84, height: size * 1.55), withAttributes: attrs)
}

func drawFlyerPhone(_ screenshot: NSImage, screenRect: NSRect, rotation: CGFloat) {
    let bezel: CGFloat = max(14, screenRect.width * 0.034)
    let body = screenRect.insetBy(dx: -bezel, dy: -bezel)
    let bodyRadius = screenRect.width * 0.105
    let screenRadius = screenRect.width * 0.084
    let center = NSPoint(x: body.midX, y: body.midY)
    let depth = max(5, screenRect.width * 0.012)

    NSGraphicsContext.saveGraphicsState()
    let transform = NSAffineTransform()
    transform.translateX(by: center.x, yBy: center.y)
    transform.rotate(byDegrees: rotation)
    transform.translateX(by: -center.x, yBy: -center.y)
    transform.concat()

    let groundShadow = NSShadow()
    groundShadow.shadowColor = NSColor(calibratedWhite: 0, alpha: 0.48)
    groundShadow.shadowBlurRadius = max(42, screenRect.width * 0.10)
    groundShadow.shadowOffset = NSSize(width: rotation * -1.2, height: -screenRect.width * 0.055)
    groundShadow.set()
    NSColor(calibratedWhite: 0, alpha: 0.82).setFill()
    NSBezierPath(ovalIn: NSRect(x: body.minX + body.width * 0.10, y: body.minY - body.width * 0.025, width: body.width * 0.80, height: body.width * 0.11)).fill()

    let shadow = NSShadow()
    shadow.shadowColor = NSColor(calibratedWhite: 0, alpha: 0.72)
    shadow.shadowBlurRadius = max(22, screenRect.width * 0.055)
    shadow.shadowOffset = NSSize(width: -rotation * 0.8, height: -screenRect.width * 0.025)
    shadow.set()
    NSColor.black.setFill()
    NSBezierPath(roundedRect: body.offsetBy(dx: rotation > 0 ? -depth : depth, dy: -depth), xRadius: bodyRadius, yRadius: bodyRadius).fill()
    NSGraphicsContext.restoreGraphicsState()

    NSGraphicsContext.saveGraphicsState()
    let transform2 = NSAffineTransform()
    transform2.translateX(by: center.x, yBy: center.y)
    transform2.rotate(byDegrees: rotation)
    transform2.translateX(by: -center.x, yBy: -center.y)
    transform2.concat()

    // Dark titanium body with a brighter rolled edge and a separate rear depth plane.
    let backPlane = body.offsetBy(dx: rotation > 0 ? -depth : depth, dy: -depth)
    let backMetal = NSGradient(colorsAndLocations:
        (NSColor(calibratedRed: 0.46, green: 0.52, blue: 0.60, alpha: 1), 0.0),
        (NSColor(calibratedRed: 0.08, green: 0.10, blue: 0.14, alpha: 1), 0.52),
        (NSColor(calibratedRed: 0.30, green: 0.38, blue: 0.48, alpha: 1), 1.0)
    )!
    backMetal.draw(in: NSBezierPath(roundedRect: backPlane, xRadius: bodyRadius, yRadius: bodyRadius), angle: 5)

    let chassis = NSGradient(colorsAndLocations:
        (NSColor(calibratedRed: 0.80, green: 0.84, blue: 0.89, alpha: 1), 0.0),
        (NSColor(calibratedRed: 0.28, green: 0.32, blue: 0.39, alpha: 1), 0.10),
        (NSColor(calibratedRed: 0.055, green: 0.065, blue: 0.09, alpha: 1), 0.42),
        (NSColor(calibratedRed: 0.14, green: 0.18, blue: 0.24, alpha: 1), 0.82),
        (NSColor(calibratedRed: 0.70, green: 0.78, blue: 0.86, alpha: 1), 1.0)
    )!
    chassis.draw(in: NSBezierPath(roundedRect: body, xRadius: bodyRadius, yRadius: bodyRadius), angle: -12)

    // A narrow polished rail gives the shell the layered, machined look used on the flyers.
    let rail = NSBezierPath(roundedRect: body.insetBy(dx: bezel * 0.24, dy: bezel * 0.24), xRadius: bodyRadius - bezel * 0.2, yRadius: bodyRadius - bezel * 0.2)
    rail.lineWidth = max(2.2, bezel * 0.18)
    NSColor(calibratedRed: 0.72, green: 0.78, blue: 0.86, alpha: 0.42).setStroke()
    rail.stroke()

    let innerRail = NSBezierPath(roundedRect: screenRect.insetBy(dx: -bezel * 0.50, dy: -bezel * 0.50), xRadius: screenRadius + bezel * 0.55, yRadius: screenRadius + bezel * 0.55)
    innerRail.lineWidth = max(1.4, bezel * 0.10)
    NSColor(calibratedWhite: 0.92, alpha: 0.24).setStroke()
    innerRail.stroke()

    // Fine antenna breaks and polished caps keep the silhouette from reading as a flat outline.
    NSColor(calibratedWhite: 0.05, alpha: 0.85).setStroke()
    for y in [body.minY + body.height * 0.18, body.maxY - body.height * 0.18] {
        let leftBreak = NSBezierPath()
        leftBreak.move(to: NSPoint(x: body.minX + 1, y: y))
        leftBreak.line(to: NSPoint(x: body.minX + bezel * 0.55, y: y))
        leftBreak.lineWidth = max(2, bezel * 0.12)
        leftBreak.stroke()
        let rightBreak = NSBezierPath()
        rightBreak.move(to: NSPoint(x: body.maxX - bezel * 0.55, y: y))
        rightBreak.line(to: NSPoint(x: body.maxX - 1, y: y))
        rightBreak.lineWidth = max(2, bezel * 0.12)
        rightBreak.stroke()
    }

    let sideWidth = max(5, bezel * 0.46)
    let leftX = body.minX - sideWidth * 0.62
    let buttonGradient = NSGradient(starting: NSColor(calibratedWhite: 0.46, alpha: 1), ending: NSColor(calibratedWhite: 0.08, alpha: 1))!
    for button in [
        NSRect(x: leftX, y: body.maxY - body.height * 0.24, width: sideWidth, height: body.height * 0.035),
        NSRect(x: leftX, y: body.maxY - body.height * 0.35, width: sideWidth, height: body.height * 0.075),
        NSRect(x: leftX, y: body.maxY - body.height * 0.45, width: sideWidth, height: body.height * 0.075),
        NSRect(x: body.maxX - sideWidth * 0.38, y: body.maxY - body.height * 0.38, width: sideWidth, height: body.height * 0.14),
    ] {
        NSGraphicsContext.saveGraphicsState()
        let buttonShadow = NSShadow()
        buttonShadow.shadowColor = NSColor.black.withAlphaComponent(0.72)
        buttonShadow.shadowBlurRadius = 3
        buttonShadow.shadowOffset = NSSize(width: 1.5, height: -1.5)
        buttonShadow.set()
        buttonGradient.draw(in: NSBezierPath(roundedRect: button, xRadius: sideWidth / 2, yRadius: sideWidth / 2), angle: 0)
        NSGraphicsContext.restoreGraphicsState()
    }

    NSColor.black.setFill()
    NSBezierPath(roundedRect: screenRect.insetBy(dx: -3, dy: -3), xRadius: screenRadius + 3, yRadius: screenRadius + 3).fill()
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: screenRect, xRadius: screenRadius, yRadius: screenRadius).addClip()
    screenshot.draw(in: screenRect, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: [.interpolation: NSImageInterpolation.high])
    NSGraphicsContext.restoreGraphicsState()

    // Subtle glass edge only; it never crosses or modifies the UI pixels.
    let glassEdge = NSBezierPath(roundedRect: screenRect.insetBy(dx: 1.2, dy: 1.2), xRadius: screenRadius, yRadius: screenRadius)
    glassEdge.lineWidth = max(1.2, screenRect.width * 0.0025)
    NSColor(calibratedWhite: 1, alpha: 0.30).setStroke()
    glassEdge.stroke()

    NSColor(calibratedRed: 0.70, green: 0.82, blue: 1.0, alpha: 0.34).setStroke()
    let rim = NSBezierPath(roundedRect: body.insetBy(dx: 1.5, dy: 1.5), xRadius: bodyRadius, yRadius: bodyRadius)
    rim.lineWidth = max(2, screenRect.width * 0.004)
    rim.stroke()
    NSGraphicsContext.restoreGraphicsState()
}

let portraitBackground = load("\(playOutput)/phone-background-master.png")
for shot in shots {
    let source = load(shot.source)

    let play = canvas(width: 1080, height: 1920) {
        drawCover(portraitBackground, in: NSRect(x: 0, y: 0, width: 1080, height: 1920))
        centeredText(shot.caption, y: 1778, width: 1080, size: 52)
        drawFlyerPhone(source, screenRect: NSRect(x: 195, y: 122, width: 690, height: 1500), rotation: shot.rotation)
    }
    writeOpaquePNG(play, to: "\(playOutput)/\(shot.name).png")

    let ios = canvas(width: 1290, height: 2796) {
        drawCover(portraitBackground, in: NSRect(x: 0, y: 0, width: 1290, height: 2796))
        centeredText(shot.caption, y: 2602, width: 1290, size: 66)
        drawFlyerPhone(source, screenRect: NSRect(x: 125, y: 115, width: 1040, height: 2261), rotation: shot.rotation * 0.82)
    }
    writeOpaquePNG(ios, to: "\(iosOutput)/\(shot.name).png")
}

let featureBackground = load("\(playOutput)/feature-background-master.png")
let featurePhone = load(shots[0].source)
let feature = canvas(width: 1024, height: 500) {
    drawCover(featureBackground, in: NSRect(x: 0, y: 0, width: 1024, height: 500))
    let titleAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont(name: "Avenir Next Bold", size: 58) ?? NSFont.systemFont(ofSize: 58, weight: .bold),
        .foregroundColor: NSColor.white,
        .kern: 2.0,
    ]
    NSString(string: "Lune Synth").draw(at: NSPoint(x: 103, y: 302), withAttributes: titleAttrs)
    let copyAttrs: [NSAttributedString.Key: Any] = [
        .font: NSFont(name: "Avenir Next Medium", size: 27) ?? NSFont.systemFont(ofSize: 27, weight: .medium),
        .foregroundColor: NSColor(calibratedRed: 0.86, green: 0.92, blue: 1, alpha: 1),
    ]
    NSString(string: "Study sets that\ngrade your work").draw(in: NSRect(x: 104, y: 210, width: 330, height: 82), withAttributes: copyAttrs)
    drawFlyerPhone(featurePhone, screenRect: NSRect(x: 690, y: -32, width: 258, height: 561), rotation: -7)
}
writeOpaquePNG(feature, to: "\(playOutput)/feature-graphic-1024x500.png")
