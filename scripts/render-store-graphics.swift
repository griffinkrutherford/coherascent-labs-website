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
    Shot(source: "\(sourceRoot)/constellations.png", name: "01-your-subjects-mapped", caption: "Your subjects, mapped", rotation: -4.4),
    Shot(source: "\(root)/mobile-app-assets/screenshots/applied/question-prompts/19-stats.png", name: "02-questions-from-your-material", caption: "Questions built from your material", rotation: -5.2),
    Shot(source: "\(sourceRoot)/choice-set.png", name: "03-practice-across-subjects", caption: "Practice across subjects", rotation: 3.8),
    Shot(source: "\(root)/mobile-app-assets/screenshots/applied/results/90-percent.png", name: "04-know-what-to-fix", caption: "Know what to fix", rotation: -3.6),
    Shot(source: "\(sourceRoot)/problem-solver-reasoning.png", name: "05-see-every-step", caption: "See every step", rotation: 5.0),
    Shot(source: "\(sourceRoot)/leaderboard.png", name: "06-progress-in-one-place", caption: "Progress in one place", rotation: 3.2),
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
    // Flyer treatment: a thin, glossy graphite iPhone shell with a restrained
    // silver lip. The display remains the dominant surface.
    let bezel: CGFloat = max(8, screenRect.width * 0.020)
    let body = screenRect.insetBy(dx: -bezel, dy: -bezel)
    let bodyRadius = screenRect.width * 0.096
    let screenRadius = screenRect.width * 0.084
    let center = NSPoint(x: body.midX, y: body.midY)
    let depth = max(10, screenRect.width * 0.022)
    let depthX: CGFloat = rotation < 0 ? depth : -depth

    NSGraphicsContext.saveGraphicsState()
    let transform = NSAffineTransform()
    transform.translateX(by: center.x, yBy: center.y)
    transform.rotate(byDegrees: rotation)
    transform.translateX(by: -center.x, yBy: -center.y)
    transform.concat()

    let shadow = NSShadow()
    shadow.shadowColor = NSColor(calibratedWhite: 0, alpha: 0.78)
    shadow.shadowBlurRadius = max(40, screenRect.width * 0.080)
    shadow.shadowOffset = NSSize(width: depthX * 1.45, height: -screenRect.width * 0.045)
    shadow.set()
    NSColor.black.setFill()
    NSBezierPath(roundedRect: body.offsetBy(dx: depthX, dy: -depth * 0.44), xRadius: bodyRadius, yRadius: bodyRadius).fill()
    NSGraphicsContext.restoreGraphicsState()

    NSGraphicsContext.saveGraphicsState()
    let transform2 = NSAffineTransform()
    transform2.translateX(by: center.x, yBy: center.y)
    transform2.rotate(byDegrees: rotation)
    transform2.translateX(by: -center.x, yBy: -center.y)
    transform2.concat()

    // A shallow dark sidewall supplies the flyer-style physical depth without
    // turning the phone into a bright illustrated frame.
    let backPlane = body.offsetBy(dx: depthX, dy: -depth * 0.44)
    let backMetal = NSGradient(colorsAndLocations:
        (NSColor(calibratedWhite: 0.76, alpha: 1), 0.0),
        (NSColor(calibratedWhite: 0.10, alpha: 1), 0.10),
        (NSColor(calibratedWhite: 0.025, alpha: 1), 0.46),
        (NSColor(calibratedWhite: 0.34, alpha: 1), 0.82),
        (NSColor(calibratedWhite: 0.055, alpha: 1), 1.0)
    )!
    backMetal.draw(in: NSBezierPath(roundedRect: backPlane, xRadius: bodyRadius, yRadius: bodyRadius), angle: 0)

    let visibleSideX = depthX > 0 ? backPlane.maxX - 1.5 : backPlane.minX + 1.5
    let sideHighlight = NSBezierPath()
    sideHighlight.move(to: NSPoint(x: visibleSideX, y: backPlane.minY + bodyRadius * 0.74))
    sideHighlight.line(to: NSPoint(x: visibleSideX, y: backPlane.maxY - bodyRadius * 0.74))
    sideHighlight.lineWidth = max(1.1, screenRect.width * 0.0018)
    NSColor(calibratedWhite: 0.72, alpha: 0.46).setStroke()
    sideHighlight.stroke()

    // Flyer 36 has visible breaks in the polished side band.
    NSColor(calibratedWhite: 0.015, alpha: 0.95).setStroke()
    for y in [backPlane.minY + backPlane.height * 0.20, backPlane.maxY - backPlane.height * 0.19] {
        let bandBreak = NSBezierPath()
        let frontBandX = depthX > 0 ? body.maxX : body.minX
        let backBandX = depthX > 0 ? backPlane.maxX : backPlane.minX
        bandBreak.move(to: NSPoint(x: frontBandX, y: y))
        bandBreak.line(to: NSPoint(x: backBandX, y: y))
        bandBreak.lineWidth = max(1.6, screenRect.width * 0.0023)
        bandBreak.stroke()
    }

    let chassis = NSGradient(colorsAndLocations:
        (NSColor(calibratedWhite: 0.54, alpha: 1), 0.0),
        (NSColor(calibratedWhite: 0.055, alpha: 1), 0.055),
        (NSColor(calibratedWhite: 0.004, alpha: 1), 0.34),
        (NSColor(calibratedWhite: 0.018, alpha: 1), 0.91),
        (NSColor(calibratedWhite: 0.28, alpha: 1), 1.0)
    )!
    chassis.draw(in: NSBezierPath(roundedRect: body, xRadius: bodyRadius, yRadius: bodyRadius), angle: 0)

    let outerLip = NSBezierPath(roundedRect: body.insetBy(dx: 0.8, dy: 0.8), xRadius: bodyRadius, yRadius: bodyRadius)
    outerLip.lineWidth = max(1.1, screenRect.width * 0.0018)
    NSColor(calibratedWhite: 0.92, alpha: 0.74).setStroke()
    outerLip.stroke()

    // Fine antenna breaks and compact black controls match the flyer references.
    NSColor(calibratedWhite: 0.02, alpha: 0.92).setStroke()
    for y in [body.minY + body.height * 0.18, body.maxY - body.height * 0.18] {
        let leftBreak = NSBezierPath()
        leftBreak.move(to: NSPoint(x: body.minX + 1, y: y))
        leftBreak.line(to: NSPoint(x: body.minX + bezel * 0.70, y: y))
        leftBreak.lineWidth = max(1.2, bezel * 0.10)
        leftBreak.stroke()
        let rightBreak = NSBezierPath()
        rightBreak.move(to: NSPoint(x: body.maxX - bezel * 0.70, y: y))
        rightBreak.line(to: NSPoint(x: body.maxX - 1, y: y))
        rightBreak.lineWidth = max(1.2, bezel * 0.10)
        rightBreak.stroke()
    }

    let sideWidth = max(4, bezel * 0.38)
    let leftX = (depthX < 0 ? backPlane.minX : body.minX) - sideWidth * 0.42
    let buttonGradient = NSGradient(starting: NSColor(calibratedWhite: 0.27, alpha: 1), ending: NSColor(calibratedWhite: 0.025, alpha: 1))!
    for button in [
        NSRect(x: leftX, y: body.maxY - body.height * 0.25, width: sideWidth, height: body.height * 0.030),
        NSRect(x: leftX, y: body.maxY - body.height * 0.35, width: sideWidth, height: body.height * 0.064),
        NSRect(x: leftX, y: body.maxY - body.height * 0.44, width: sideWidth, height: body.height * 0.064),
        NSRect(x: (depthX > 0 ? backPlane.maxX : body.maxX) - sideWidth * 0.52, y: body.maxY - body.height * 0.37, width: sideWidth, height: body.height * 0.12),
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

    NSColor(calibratedWhite: 0.002, alpha: 1).setFill()
    NSBezierPath(roundedRect: screenRect.insetBy(dx: -2.0, dy: -2.0), xRadius: screenRadius + 2, yRadius: screenRadius + 2).fill()
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: screenRect, xRadius: screenRadius, yRadius: screenRadius).addClip()
    screenshot.draw(in: screenRect, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: [.interpolation: NSImageInterpolation.high])
    NSGraphicsContext.restoreGraphicsState()

    // A single glass hairline; no bright nested rings and nothing over the UI.
    let glassEdge = NSBezierPath(roundedRect: screenRect.insetBy(dx: 0.75, dy: 0.75), xRadius: screenRadius, yRadius: screenRadius)
    glassEdge.lineWidth = max(0.9, screenRect.width * 0.0015)
    NSColor(calibratedWhite: 1, alpha: 0.22).setStroke()
    glassEdge.stroke()
    NSGraphicsContext.restoreGraphicsState()
}

// Exact raster counterpart of the phone shell used on the Lune Synth site.
// Proportions below come directly from the workflow-phone CSS custom properties.
func drawSitePhone(_ screenshot: NSImage, screenRect: NSRect, rotation: CGFloat) {
    let shellPadding = screenRect.height * 0.013636
    let body = screenRect.insetBy(dx: -shellPadding, dy: -shellPadding)
    let bodyRadius = screenRect.height * 0.122727
    let screenRadius = screenRect.height * 0.104545
    let overlayInset = shellPadding / 3
    let center = NSPoint(x: body.midX, y: body.midY)

    NSGraphicsContext.saveGraphicsState()
    let transform = NSAffineTransform()
    transform.translateX(by: center.x, yBy: center.y)
    transform.rotate(byDegrees: rotation)
    transform.translateX(by: -center.x, yBy: -center.y)
    transform.concat()

    NSGraphicsContext.saveGraphicsState()
    let shadow = NSShadow()
    shadow.shadowColor = NSColor(calibratedRed: 4 / 255, green: 10 / 255, blue: 24 / 255, alpha: 0.42)
    shadow.shadowBlurRadius = screenRect.height * 0.028
    shadow.shadowOffset = NSSize(width: 0, height: -screenRect.height * 0.020)
    shadow.set()
    NSColor.black.setFill()
    NSBezierPath(roundedRect: body, xRadius: bodyRadius, yRadius: bodyRadius).fill()
    NSGraphicsContext.restoreGraphicsState()

    let shellPath = NSBezierPath(roundedRect: body, xRadius: bodyRadius, yRadius: bodyRadius)
    let shellGradient = NSGradient(colorsAndLocations:
        (NSColor(calibratedRed: 17 / 255, green: 20 / 255, blue: 27 / 255, alpha: 1), 0.0),
        (NSColor(calibratedRed: 5 / 255, green: 6 / 255, blue: 10 / 255, alpha: 1), 0.16),
        (NSColor(calibratedRed: 1 / 255, green: 1 / 255, blue: 2 / 255, alpha: 1), 0.58),
        (NSColor(calibratedRed: 7 / 255, green: 9 / 255, blue: 14 / 255, alpha: 1), 1.0)
    )!
    shellGradient.draw(in: shellPath, angle: -90)

    NSColor(calibratedRed: 56 / 255, green: 64 / 255, blue: 80 / 255, alpha: 1).setStroke()
    shellPath.lineWidth = max(1, screenRect.height * 0.00065)
    shellPath.stroke()

    let overlay = NSBezierPath(
        roundedRect: body.insetBy(dx: overlayInset, dy: overlayInset),
        xRadius: bodyRadius - overlayInset,
        yRadius: bodyRadius - overlayInset
    )
    overlay.lineWidth = max(2, screenRect.height * 0.00125)
    NSColor(calibratedWhite: 0, alpha: 0.78).setStroke()
    overlay.stroke()

    let buttonWidth = screenRect.height * 0.0068
    let volumeTop = body.maxY - screenRect.height * 0.245455
    let volumeHeight = screenRect.height * 0.081818
    let volumeGap = screenRect.height * 0.031818
    let powerTop = body.maxY - screenRect.height * 0.345455
    let powerHeight = screenRect.height * 0.136364
    let leftX = body.minX - buttonWidth * 0.52
    let rightX = body.maxX - buttonWidth * 0.48
    let leftButtonGradient = NSGradient(colorsAndLocations:
        (NSColor(calibratedRed: 22 / 255, green: 28 / 255, blue: 41 / 255, alpha: 1), 0.0),
        (NSColor(calibratedRed: 144 / 255, green: 159 / 255, blue: 186 / 255, alpha: 1), 0.18),
        (NSColor(calibratedRed: 84 / 255, green: 97 / 255, blue: 122 / 255, alpha: 1), 0.44),
        (NSColor(calibratedRed: 16 / 255, green: 22 / 255, blue: 34 / 255, alpha: 1), 1.0)
    )!
    let rightButtonGradient = NSGradient(colorsAndLocations:
        (NSColor(calibratedRed: 16 / 255, green: 22 / 255, blue: 34 / 255, alpha: 1), 0.0),
        (NSColor(calibratedRed: 84 / 255, green: 97 / 255, blue: 122 / 255, alpha: 1), 0.56),
        (NSColor(calibratedRed: 144 / 255, green: 159 / 255, blue: 186 / 255, alpha: 1), 0.82),
        (NSColor(calibratedRed: 22 / 255, green: 28 / 255, blue: 41 / 255, alpha: 1), 1.0)
    )!
    let buttons: [(NSRect, NSGradient)] = [
        (NSRect(x: leftX, y: volumeTop - volumeHeight, width: buttonWidth, height: volumeHeight), leftButtonGradient),
        (NSRect(x: leftX, y: volumeTop - volumeHeight * 2 - volumeGap, width: buttonWidth, height: volumeHeight), leftButtonGradient),
        (NSRect(x: rightX, y: powerTop - powerHeight, width: buttonWidth, height: powerHeight), rightButtonGradient),
    ]
    for (button, gradient) in buttons {
        NSGraphicsContext.saveGraphicsState()
        let buttonShadow = NSShadow()
        buttonShadow.shadowColor = NSColor(calibratedRed: 4 / 255, green: 10 / 255, blue: 24 / 255, alpha: 0.24)
        buttonShadow.shadowBlurRadius = screenRect.height * 0.006
        buttonShadow.shadowOffset = NSSize(width: 0, height: -1)
        buttonShadow.set()
        gradient.draw(in: NSBezierPath(roundedRect: button, xRadius: buttonWidth / 2, yRadius: buttonWidth / 2), angle: 0)
        NSGraphicsContext.restoreGraphicsState()
    }

    NSColor.black.setFill()
    NSBezierPath(roundedRect: screenRect.insetBy(dx: -2, dy: -2), xRadius: screenRadius + 2, yRadius: screenRadius + 2).fill()
    NSGraphicsContext.saveGraphicsState()
    NSBezierPath(roundedRect: screenRect, xRadius: screenRadius, yRadius: screenRadius).addClip()
    screenshot.draw(in: screenRect, from: .zero, operation: .copy, fraction: 1, respectFlipped: true, hints: [.interpolation: NSImageInterpolation.high])
    NSGraphicsContext.restoreGraphicsState()

    let screenEdge = NSBezierPath(roundedRect: screenRect.insetBy(dx: 0.7, dy: 0.7), xRadius: screenRadius, yRadius: screenRadius)
    screenEdge.lineWidth = max(1, screenRect.height * 0.0007)
    NSColor(calibratedWhite: 1, alpha: 0.04).setStroke()
    screenEdge.stroke()
    NSGraphicsContext.restoreGraphicsState()
}

let portraitBackground = load("\(playOutput)/phone-background-master.png")
for shot in shots {
    let source = load(shot.source)

    let play = canvas(width: 1080, height: 1920) {
        drawCover(portraitBackground, in: NSRect(x: 0, y: 0, width: 1080, height: 1920))
        centeredText(shot.caption, y: 1778, width: 1080, size: 52)
        drawSitePhone(source, screenRect: NSRect(x: 195, y: 122, width: 690, height: 1500), rotation: shot.rotation)
    }
    writeOpaquePNG(play, to: "\(playOutput)/\(shot.name).png")

    let ios = canvas(width: 1290, height: 2796) {
        drawCover(portraitBackground, in: NSRect(x: 0, y: 0, width: 1290, height: 2796))
        centeredText(shot.caption, y: 2602, width: 1290, size: 66)
        drawSitePhone(source, screenRect: NSRect(x: 125, y: 115, width: 1040, height: 2261), rotation: shot.rotation * 0.82)
    }
    writeOpaquePNG(ios, to: "\(iosOutput)/\(shot.name).png")
}

let featureBackground = load("\(playOutput)/feature-background-master.png")
let featurePhone = load("\(root)/mobile-app-assets/screenshots/applied/question-prompts/19-stats.png")
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
    drawSitePhone(featurePhone, screenRect: NSRect(x: 690, y: -32, width: 258, height: 561), rotation: -7)
}
writeOpaquePNG(feature, to: "\(playOutput)/feature-graphic-1024x500.png")
