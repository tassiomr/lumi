import Foundation
import Testing
@testable import LumiLegal

@Suite struct LumiLinksTests {
    @Test func buildsUrlsForEveryPage() throws {
        let links = try #require(LumiLinks(string: "https://lumi.example/"))
        #expect(links.url(for: .privacy).absoluteString == "https://lumi.example/privacy")
        #expect(links.url(for: .privacyChoices).absoluteString == "https://lumi.example/privacy-choices")
        #expect(links.url(for: .deleteAccount).absoluteString == "https://lumi.example/delete-account")
        for page in LumiPage.allCases {
            #expect(links.url(for: page).absoluteString == "https://lumi.example" + page.path)
        }
    }

    @Test func rejectsInsecureOrEmptyBaseUrls() {
        #expect(LumiLinks(string: "") == nil)
        #expect(LumiLinks(string: "http://lumi.example") == nil)
        #expect(LumiLinks(string: "lumi.example") == nil)
        #expect(LumiLinks(string: "$(LUMI_WEBSITE_URL)") == nil)
        #expect(LumiLinks(string: "http://localhost:3000") != nil)
    }

    @Test func pathsAreUniqueAndAbsolute() {
        let paths = LumiPage.allCases.map(\.path)
        #expect(Set(paths).count == paths.count)
        #expect(paths.allSatisfy { $0.hasPrefix("/") && !$0.hasSuffix("/") })
    }

    @Test func settingsSectionListsEveryPage() {
        let shown = Set(AboutLegalSection.webPages + [.deleteAccount])
        #expect(shown == Set(LumiPage.allCases))
    }
}
