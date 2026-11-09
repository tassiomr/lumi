// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "LumiLegal",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "LumiLegal", targets: ["LumiLegal"]),
    ],
    dependencies: [
        .package(url: "https://github.com/tassiomr/TRDesignSystem.git", .upToNextMinor(from: "0.2.0")),
    ],
    targets: [
        .target(name: "LumiLegal", dependencies: [.product(name: "TRDesignSystem", package: "TRDesignSystem")]),
        .testTarget(name: "LumiLegalTests", dependencies: ["LumiLegal"]),
    ]
)
