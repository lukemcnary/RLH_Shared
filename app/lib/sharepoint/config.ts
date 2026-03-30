import type { ProjectFileLibraryKey } from '@/types/database'

export type SharePointMetadataFieldType = 'text' | 'date' | 'choice' | 'boolean'

export interface SharePointMetadataField {
  key: string
  label: string
  type: SharePointMetadataFieldType
  required: boolean
  helpText?: string
  options?: string[]
  placeholder?: string
  sharePointFieldName?: string
}

export interface SharePointLibraryDefinition {
  key: ProjectFileLibraryKey
  displayName: string
  description: string
  metadataFields: SharePointMetadataField[]
}

export const CANONICAL_PROJECT_LIBRARIES: SharePointLibraryDefinition[] = [
  {
    key: 'drawing_files',
    displayName: 'Drawing Files',
    description: 'Issued drawing sets used to build the project.',
    metadataFields: [
      {
        key: 'discipline',
        label: 'Discipline',
        type: 'text',
        required: true,
        placeholder: 'Architectural',
      },
      {
        key: 'drawingSetName',
        label: 'Drawing Set Name',
        type: 'text',
        required: true,
        placeholder: 'Permit Set',
      },
      {
        key: 'drawingIssueType',
        label: 'Drawing Issue Type',
        type: 'text',
        required: true,
        placeholder: 'Issued for Permit',
      },
      {
        key: 'issuedDate',
        label: 'Issued Date',
        type: 'date',
        required: true,
      },
      {
        key: 'drawingStatus',
        label: 'Drawing Status',
        type: 'choice',
        required: true,
        options: ['Current', 'Superseded'],
      },
    ],
  },
  {
    key: 'model_files',
    displayName: 'Model Files',
    description: 'Coordination, visualization, and reference models.',
    metadataFields: [
      {
        key: 'modelDiscipline',
        label: 'Model Discipline',
        type: 'text',
        required: true,
        placeholder: 'Interior Design',
      },
      {
        key: 'modelFileType',
        label: 'Model File Type',
        type: 'text',
        required: true,
        placeholder: 'Revit',
      },
      {
        key: 'source',
        label: 'Source',
        type: 'text',
        required: true,
        placeholder: 'Architect',
      },
      {
        key: 'modelStatus',
        label: 'Model Status',
        type: 'choice',
        required: true,
        options: ['Current', 'WIP (internal only)', 'Superseded'],
      },
    ],
  },
  {
    key: 'trade_files',
    displayName: 'Trade Files',
    description: 'Trade coordination documents exchanged with partners.',
    metadataFields: [
      {
        key: 'trade',
        label: 'Trade',
        type: 'text',
        required: true,
        placeholder: 'Cabinets',
      },
      {
        key: 'associatedCompany',
        label: 'Associated Company',
        type: 'text',
        required: true,
        placeholder: 'Acme Millwork',
      },
      {
        key: 'documentType',
        label: 'Document Type',
        type: 'choice',
        required: false,
        options: ['Scope', 'Estimate', 'Contract', 'Change Order', 'Warranty'],
      },
      {
        key: 'tradeDocumentStatus',
        label: 'Trade Document Status',
        type: 'choice',
        required: true,
        options: ['Received', 'Under Review', 'Revised', 'Final', 'Superseded'],
      },
    ],
  },
  {
    key: 'field_files',
    displayName: 'Field Files',
    description: 'Promoted field artifacts worth keeping as part of the project record.',
    metadataFields: [
      {
        key: 'category',
        label: 'Category',
        type: 'choice',
        required: true,
        options: ['Site Photo', 'Progress', 'Issue', 'Inspection', 'Safety', 'QA/QC', 'Permit/Compliance', 'Delivery', 'Other'],
      },
      {
        key: 'description',
        label: 'Description',
        type: 'text',
        required: false,
        placeholder: 'What is important about this artifact?',
      },
    ],
  },
  {
    key: 'admin_files',
    displayName: 'Admin Files',
    description: 'Financial, legal, contractual, and compliance documents.',
    metadataFields: [
      {
        key: 'adminDocumentType',
        label: 'Admin Document Type',
        type: 'text',
        required: true,
        placeholder: 'Insurance Certificate',
      },
      {
        key: 'adminDocumentStatus',
        label: 'Admin Document Status',
        type: 'choice',
        required: true,
        options: ['Draft', 'Under Review', 'Approved', 'Executed', 'Superseded'],
      },
      {
        key: 'associatedCompany',
        label: 'Associated Company',
        type: 'text',
        required: false,
        placeholder: 'Carrier or subcontractor',
      },
      {
        key: 'receivedDate',
        label: 'Received Date',
        type: 'date',
        required: false,
      },
      {
        key: 'includeInDraw',
        label: 'Include in Draw',
        type: 'boolean',
        required: false,
      },
    ],
  },
]

export function getLibraryDefinition(key: ProjectFileLibraryKey) {
  const match = CANONICAL_PROJECT_LIBRARIES.find((library) => library.key === key)
  if (!match) {
    throw new Error(`Unknown SharePoint library key: ${key}`)
  }
  return match
}
