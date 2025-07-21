import { renderHook, act } from "@testing-library/react"
import { useVersionControl } from "../hooks/use-version-control"
import { VersionControlService } from "../lib/version-control-service"

// Mock the VersionControlService
jest.mock("../lib/version-control-service", () => {
  return {
    VersionControlService: jest.fn().mockImplementation(() => ({
      getVersionHistory: jest.fn().mockResolvedValue([
        {
          id: "version-2",
          resourceId: "resource-123",
          versionNumber: 2,
          content: "Updated content",
          createdBy: "user-1",
          createdAt: new Date(),
          tags: ["latest"],
        },
        {
          id: "version-1",
          resourceId: "resource-123",
          versionNumber: 1,
          content: "Initial content",
          createdBy: "user-1",
          createdAt: new Date(Date.now() - 3600000), // 1 hour ago
          tags: [],
        },
      ]),
      getVersion: jest.fn().mockImplementation((versionId) => {
        if (versionId === "version-1") {
          return Promise.resolve({
            id: "version-1",
            resourceId: "resource-123",
            versionNumber: 1,
            content: "Initial content",
            createdBy: "user-1",
            createdAt: new Date(Date.now() - 3600000),
            tags: [],
          })
        } else {
          return Promise.resolve({
            id: "version-2",
            resourceId: "resource-123",
            versionNumber: 2,
            content: "Updated content",
            createdBy: "user-1",
            createdAt: new Date(),
            tags: ["latest"],
          })
        }
      }),
      createVersion: jest.fn().mockResolvedValue({
        id: "version-3",
        resourceId: "resource-123",
        versionNumber: 3,
        content: "New content",
        createdBy: "user-1",
        createdAt: new Date(),
        tags: [],
      }),
      compareVersions: jest.fn().mockResolvedValue({
        previousVersion: {
          id: "version-1",
          resourceId: "resource-123",
          versionNumber: 1,
          content: "Initial content",
          createdBy: "user-1",
          createdAt: new Date(Date.now() - 3600000),
          tags: [],
        },
        currentVersion: {
          id: "version-2",
          resourceId: "resource-123",
          versionNumber: 2,
          content: "Updated content",
          createdBy: "user-1",
          createdAt: new Date(),
          tags: ["latest"],
        },
        additions: ["Updated"],
        deletions: ["Initial"],
        modifications: [],
      }),
      restoreVersion: jest.fn().mockResolvedValue({
        id: "version-3",
        resourceId: "resource-123",
        versionNumber: 3,
        content: "Initial content",
        comment: "Restored from version 1",
        createdBy: "user-1",
        createdAt: new Date(),
        tags: [],
      }),
      tagVersion: jest.fn().mockImplementation((versionId, tag) => {
        return Promise.resolve({
          id: versionId,
          resourceId: "resource-123",
          versionNumber: versionId === "version-1" ? 1 : 2,
          content: versionId === "version-1" ? "Initial content" : "Updated content",
          createdBy: "user-1",
          createdAt: versionId === "version-1" ? new Date(Date.now() - 3600000) : new Date(),
          tags: [tag],
        })
      }),
      untagVersion: jest.fn().mockImplementation((versionId) => {
        return Promise.resolve({
          id: versionId,
          resourceId: "resource-123",
          versionNumber: versionId === "version-1" ? 1 : 2,
          content: versionId === "version-1" ? "Initial content" : "Updated content",
          createdBy: "user-1",
          createdAt: versionId === "version-1" ? new Date(Date.now() - 3600000) : new Date(),
          tags: [],
        })
      }),
      getVersionsByTag: jest.fn().mockResolvedValue([
        {
          id: "version-2",
          resourceId: "resource-123",
          versionNumber: 2,
          content: "Updated content",
          createdBy: "user-1",
          createdAt: new Date(),
          tags: ["latest"],
        },
      ]),
    })),
  }
})

// Mock Supabase client
jest.mock("@supabase/auth-helpers-nextjs", () => ({
  createClientComponentClient: jest.fn().mockImplementation(() => ({
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: {
          user: {
            id: "user-1",
            email: "test@example.com",
          },
        },
      }),
    },
  })),
}))

describe("useVersionControl", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("should load versions on initialization", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Initially loading
    expect(result.current.state.isLoading).toBe(true)

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Should have versions in state
    expect(result.current.state.versions.length).toBe(2)
    expect(result.current.state.currentVersion).not.toBeNull()
    expect(result.current.state.selectedVersion).not.toBeNull()
    expect(result.current.state.isLoading).toBe(false)
  })

  it("should create a new version", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Create a new version
    await act(async () => {
      await result.current.createVersion("New content", "Test comment", ["test"])
    })

    // VersionControlService.createVersion should have been called
    const versionControlService = (VersionControlService as jest.Mock).mock.results[0].value
    expect(versionControlService.createVersion).toHaveBeenCalledWith(
      "resource-123",
      "New content",
      "user-1",
      "Test comment",
      ["test"]
    )

    // getVersionHistory should have been called to refresh versions
    expect(versionControlService.getVersionHistory).toHaveBeenCalledTimes(2)
  })

  it("should select a version", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Select a version
    await act(async () => {
      await result.current.selectVersion("version-1")
    })

    // VersionControlService.getVersion should have been called
    const versionControlService = (VersionControlService as jest.Mock).mock.results[0].value
    expect(versionControlService.getVersion).toHaveBeenCalledWith("version-1")

    // Selected version should be updated
    expect(result.current.state.selectedVersion?.id).toBe("version-1")
  })

  it("should compare versions", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Compare versions
    await act(async () => {
      await result.current.compareVersions("version-1", "version-2")
    })

    // VersionControlService.compareVersions should have been called
    const versionControlService = (VersionControlService as jest.Mock).mock.results[0].value
    expect(versionControlService.compareVersions).toHaveBeenCalledWith("version-1", "version-2")

    // Comparison should be updated
    expect(result.current.state.comparison).not.toBeNull()
    expect(result.current.state.comparison?.previousVersion.id).toBe("version-1")
    expect(result.current.state.comparison?.currentVersion.id).toBe("version-2")
  })

  it("should restore a version", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Restore a version
    await act(async () => {
      await result.current.restoreVersion("version-1")
    })

    // VersionControlService.restoreVersion should have been called
    const versionControlService = (VersionControlService as jest.Mock).mock.results[0].value
    expect(versionControlService.restoreVersion).toHaveBeenCalledWith("version-1", "user-1")

    // getVersionHistory should have been called to refresh versions
    expect(versionControlService.getVersionHistory).toHaveBeenCalledTimes(2)
  })

  it("should tag a version", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Tag a version
    await act(async () => {
      await result.current.tagVersion("version-1", "published")
    })

    // VersionControlService.tagVersion should have been called
    const versionControlService = (VersionControlService as jest.Mock).mock.results[0].value
    expect(versionControlService.tagVersion).toHaveBeenCalledWith("version-1", "published")

    // Versions should be updated
    expect(result.current.state.versions.find(v => v.id === "version-1")?.tags).toContain("published")
  })

  it("should untag a version", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Untag a version
    await act(async () => {
      await result.current.untagVersion("version-2", "latest")
    })

    // VersionControlService.untagVersion should have been called
    const versionControlService = (VersionControlService as jest.Mock).mock.results[0].value
    expect(versionControlService.untagVersion).toHaveBeenCalledWith("version-2", "latest")

    // Versions should be updated
    expect(result.current.state.versions.find(v => v.id === "version-2")?.tags).not.toContain("latest")
  })

  it("should get versions by tag", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Get versions by tag
    let taggedVersions
    await act(async () => {
      taggedVersions = await result.current.getVersionsByTag("latest")
    })

    // VersionControlService.getVersionsByTag should have been called
    const versionControlService = (VersionControlService as jest.Mock).mock.results[0].value
    expect(versionControlService.getVersionsByTag).toHaveBeenCalledWith("resource-123", "latest")

    // Should return tagged versions
    expect(taggedVersions).toHaveLength(1)
    expect(taggedVersions[0].id).toBe("version-2")
  })

  it("should clear comparison", async () => {
    const { result } = renderHook(() =>
      useVersionControl({
        resourceId: "resource-123",
        resourceType: "document",
      })
    )

    // Wait for initialization
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    // Compare versions
    await act(async () => {
      await result.current.compareVersions("version-1", "version-2")
    })

    // Comparison should be set
    expect(result.current.state.comparison).not.toBeNull()

    // Clear comparison
    act(() => {
      result.current.clearComparison()
    })

    // Comparison should be cleared
    expect(result.current.state.comparison).toBeNull()
  })
})