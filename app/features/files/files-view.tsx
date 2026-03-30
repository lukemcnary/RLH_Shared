'use client'

import { useMemo, useState } from 'react'
import { Badge } from '@/components/badge'
import { Button } from '@/components/button'
import { EmptyState } from '@/components/empty-state'
import { PageHeader } from '@/components/page-header'
import type { ProjectFile, ProjectFileLibraryKey } from '@/types/database'
import type { ProjectFilesHubData } from '@/lib/sharepoint/project-files'
import {
  attachFileToRecord,
  connectProjectSharePointSite,
  detachFileFromRecord,
  registerExistingSharePointFile,
  uploadProjectFile,
} from './actions'

function formatFileSize(bytes?: number) {
  if (!bytes) return 'Unknown size'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function FileRow({
  file,
  projectId,
}: {
  file: ProjectFile
  projectId: string
}) {
  return (
    <div
      style={{
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--surface-elevated)',
        padding: 'var(--space-4)',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ flex: 1 }}>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
            {file.name}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-tertiary)', display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            <span>{formatFileSize(file.fileSizeBytes)}</span>
            {file.mimeType && <span>{file.mimeType}</span>}
            {(file.modifiedAt ?? file.createdAt) && <span>{(file.modifiedAt ?? file.createdAt)?.slice(0, 10)}</span>}
          </div>
          {(file.notes || file.description) && (
            <p className="text-sm" style={{ color: 'var(--text-secondary)', marginTop: 'var(--space-2)', marginBottom: 0 }}>
              {file.notes ?? file.description}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <Badge color={file.registrationState === 'registered' ? 'accent' : 'gray'}>
            {file.registrationState === 'registered' ? 'Registered' : 'SharePoint only'}
          </Badge>
          {file.sharepointUrl && (
            <a
              href={file.sharepointUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-medium hover:opacity-80"
              style={{ color: 'var(--accent)', textDecoration: 'none' }}
            >
              Open
            </a>
          )}
        </div>
      </div>

      {file.linkedRecords && file.linkedRecords.length > 0 && (
        <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          {file.linkedRecords.map((link) => (
            <form key={link.id} action={detachFileFromRecord} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="linkId" value={link.id} />
              <Badge color="green">{link.linkedRecordLabel ?? `${link.linkedRecordType} • ${link.linkedRecordId}`}</Badge>
              <Button type="submit" variant="ghost" size="sm">
                Detach
              </Button>
            </form>
          ))}
        </div>
      )}

      <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {file.registrationState === 'sharepoint_only' && file.sharePointDriveId && file.sharePointItemId && (
          <form action={registerExistingSharePointFile}>
            <input type="hidden" name="projectId" value={projectId} />
            <input type="hidden" name="libraryKey" value={file.libraryKey} />
            <input type="hidden" name="driveId" value={file.sharePointDriveId} />
            <input type="hidden" name="itemId" value={file.sharePointItemId} />
            <Button type="submit" variant="secondary" size="sm">
              Register in Dataverse
            </Button>
          </form>
        )}

        {file.registrationState === 'registered' && file.registeredFileId && (
          <details>
            <summary className="text-xs font-medium" style={{ color: 'var(--text-secondary)', cursor: 'pointer' }}>
              Attach to a record
            </summary>
            <form
              action={attachFileToRecord}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr)) auto',
                gap: 'var(--space-2)',
                marginTop: 'var(--space-2)',
              }}
            >
              <input type="hidden" name="projectId" value={projectId} />
              <input type="hidden" name="fileId" value={file.registeredFileId} />
              <select
                name="linkedRecordType"
                defaultValue="rlh_scopeitems"
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
              >
                <option value="rlh_scopeitems">Project Scope</option>
                <option value="rlh_costitems">Cost Item</option>
                <option value="rlh_bidpackages">Bid Package</option>
                <option value="rlh_tasks">Action Item</option>
                <option value="rlh_changeorders">Change Order</option>
                <option value="rlh_rfis">RFI</option>
                <option value="rlh_selections">Selection</option>
              </select>
              <input
                type="text"
                name="linkedRecordId"
                placeholder="Record ID"
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                name="linkedRecordLabel"
                placeholder="Optional label"
                style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
              />
              <Button type="submit" variant="secondary" size="sm">
                Attach
              </Button>
            </form>
          </details>
        )}
      </div>
    </div>
  )
}

export function ProjectFilesView({
  projectId,
  data,
}: {
  projectId: string
  data: ProjectFilesHubData
}) {
  const [selectedLibrary, setSelectedLibrary] = useState<ProjectFileLibraryKey | 'all'>('all')
  const [search, setSearch] = useState('')
  const [uploadLibrary, setUploadLibrary] = useState<ProjectFileLibraryKey>(data.libraries[0]?.key ?? 'drawing_files')

  const visibleLibraries = useMemo(() => {
    return data.libraries
      .filter((library) => selectedLibrary === 'all' || library.key === selectedLibrary)
      .map((library) => ({
        ...library,
        files: library.files.filter((file) => {
          const haystack = [file.name, file.notes, file.description]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
          return haystack.includes(search.toLowerCase())
        }),
      }))
      .filter((library) => library.files.length > 0 || selectedLibrary === library.key || search.length === 0)
  }, [data.libraries, search, selectedLibrary])

  const currentUploadLibrary = data.libraries.find((library) => library.key === uploadLibrary) ?? data.libraries[0]

  return (
    <div style={{ padding: '40px var(--space-6)', overflowY: 'auto', height: '100%' }}>
      <PageHeader title="Files">
        <Badge color={data.hasSiteBinding ? 'green' : 'gray'}>
          {data.hasSiteBinding ? 'SharePoint Connected' : 'Site Not Connected'}
        </Badge>
      </PageHeader>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-5)',
        }}
      >
        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>Total Files</div>
          <div className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>{data.totalFiles}</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>Registered</div>
          <div className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--accent)', marginTop: 'var(--space-2)' }}>{data.registeredCount}</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>SharePoint Only</div>
          <div className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>{data.sharePointOnlyCount}</div>
        </div>
        <div style={{ backgroundColor: 'var(--surface-elevated)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-4)' }}>
          <div className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em' }}>Libraries</div>
          <div className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)', marginTop: 'var(--space-2)' }}>{data.libraries.length}</div>
        </div>
      </div>

      {!data.hasSiteBinding ? (
        <EmptyState
          title="Connect the project SharePoint site"
          description="This project needs a SharePoint site binding before the files hub can browse libraries or accept uploads."
        >
          <form action={connectProjectSharePointSite} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', width: '100%', maxWidth: 520 }}>
            <input type="hidden" name="projectId" value={projectId} />
            <input
              type="url"
              name="sharePointSiteUrl"
              placeholder="https://contoso.sharepoint.com/sites/Project-Name"
              style={{
                flex: 1,
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--surface-primary)',
                color: 'var(--text-primary)',
              }}
            />
            <Button type="submit">Connect</Button>
          </form>
        </EmptyState>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.1fr) minmax(320px, 0.9fr)',
              gap: 'var(--space-5)',
              marginBottom: 'var(--space-5)',
            }}
          >
            <section
              style={{
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                Browse
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 220px', gap: 'var(--space-3)' }}>
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by file name or notes"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                  }}
                />
                <select
                  value={selectedLibrary}
                  onChange={(event) => setSelectedLibrary(event.target.value as ProjectFileLibraryKey | 'all')}
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    padding: 'var(--space-2) var(--space-3)',
                    backgroundColor: 'var(--surface-primary)',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="all">All Libraries</option>
                  {data.libraries.map((library) => (
                    <option key={library.key} value={library.key}>
                      {library.displayName}
                    </option>
                  ))}
                </select>
              </div>
              {data.project.sharePointSiteUrl && (
                <p className="text-xs" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-3)', marginBottom: 0 }}>
                  Connected site: {data.project.sharePointSiteUrl}
                </p>
              )}
            </section>

            <section
              style={{
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-5)',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <h2 className="text-sm font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', marginBottom: 'var(--space-3)' }}>
                Upload
              </h2>
              <form action={uploadProjectFile} style={{ display: 'grid', gap: 'var(--space-3)' }}>
                <input type="hidden" name="projectId" value={projectId} />
                <div>
                  <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', display: 'block', marginBottom: 'var(--space-1)' }}>
                    Library
                  </label>
                  <select
                    name="libraryKey"
                    value={uploadLibrary}
                    onChange={(event) => setUploadLibrary(event.target.value as ProjectFileLibraryKey)}
                    style={{
                      width: '100%',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-2) var(--space-3)',
                      backgroundColor: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {data.libraries.map((library) => (
                      <option key={library.key} value={library.key}>
                        {library.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', display: 'block', marginBottom: 'var(--space-1)' }}>
                    File
                  </label>
                  <input
                    type="file"
                    name="file"
                    style={{
                      width: '100%',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-2)',
                      backgroundColor: 'var(--surface-primary)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {currentUploadLibrary?.metadataFields.map((field) => (
                  <div key={field.key}>
                    <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', display: 'block', marginBottom: 'var(--space-1)' }}>
                      {field.label}{field.required ? ' *' : ''}
                    </label>
                    {field.type === 'choice' ? (
                      <select
                        name={`metadata_${field.key}`}
                        defaultValue=""
                        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
                      >
                        <option value="">Select…</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'boolean' ? (
                      <select
                        name={`metadata_${field.key}`}
                        defaultValue=""
                        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
                      >
                        <option value="">Select…</option>
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    ) : (
                      <input
                        type={field.type}
                        name={`metadata_${field.key}`}
                        placeholder={field.placeholder}
                        style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
                      />
                    )}
                  </div>
                ))}

                <div>
                  <label className="text-xs font-semibold uppercase" style={{ color: 'var(--text-tertiary)', letterSpacing: '0.06em', display: 'block', marginBottom: 'var(--space-1)' }}>
                    App Notes
                  </label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Optional notes for app search, context, or record links"
                    style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: 'var(--space-2) var(--space-3)', backgroundColor: 'var(--surface-primary)', color: 'var(--text-primary)' }}
                  />
                </div>

                <Button type="submit">Upload to SharePoint</Button>
              </form>
            </section>
          </div>

          {data.loadError && (
            <div style={{ marginBottom: 'var(--space-5)' }}>
              <EmptyState
                title="SharePoint files could not be loaded"
                description={data.loadError}
              />
            </div>
          )}

          <div style={{ display: 'grid', gap: 'var(--space-5)' }}>
            {visibleLibraries.map((library) => (
              <section key={library.key}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight" style={{ color: 'var(--text-primary)', marginBottom: 'var(--space-1)' }}>
                      {library.displayName}
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                      {library.description}
                    </p>
                  </div>
                  <Badge color="gray">{library.files.length} files</Badge>
                </div>

                {library.files.length === 0 ? (
                  <div
                    style={{
                      border: '1px dashed var(--border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-5)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    No files match the current filter.
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
                    {library.files.map((file) => (
                      <FileRow key={file.id} file={file} projectId={projectId} />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
