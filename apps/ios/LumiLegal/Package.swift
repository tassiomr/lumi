// swift-tools-version: 6.0
import PackageDescription

let package = Package(
    name: "LumiLegal",
    platforms: [.iOS(.v17), .macOS(.v14)],
    products: [
        .library(name: "LumiLegal", targets: ["LumiLegal"]),
    ],
    targets: [
        .target(name: "LumiLegal"),
        .testTarget(name: "LumiLegalTests", dependencies: ["LumiLegal"]),
    ]
)
