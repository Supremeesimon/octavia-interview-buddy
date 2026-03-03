# VAPI Webhook Request Body Schema

This document defines the structure of the request body that our Firebase Function will receive from VAPI webhooks.

## Request Body Structure

```json
{
  "message": {
    "type": "string",
    "callId": "string",
    "startedAt": "string (ISO 8601 timestamp)",
    "endedAt": "string (ISO 8601 timestamp)",
    "endedReason": "string",
    "cost": "number",
    "compliance": {
      "pii": {
        "violations": "array"
      },
      "pci": {
        "violations": "array"
      }
    },
    "transcript": "string",
    "recordingUrl": "string",
    "summary": "string",
    "structuredData": {
      "categories": "array",
      "strengths": "array",
      "improvements": "array",
      "recommendations": "array"
    },
    "successEvaluation": {
      "score": "number",
      "passed": "boolean"
    },
    "duration": "number",
    "metadata": {
      "studentId": "string",
      "departmentId": "string",
      "institutionId": "string",
      "interviewType": "string"
    }
  }
}
```

## Detailed Property Descriptions

### Root Level
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| message | object | Yes | Contains the webhook payload |

### Message Object
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| type | string | Yes | Type of message (e.g., "end-of-call-report") |
| callId | string | Yes | Unique identifier for the call |
| startedAt | string | Yes | ISO 8601 timestamp when call started |
| endedAt | string | Yes | ISO 8601 timestamp when call ended |
| endedReason | string | Yes | Reason the call ended |
| cost | number | Yes | Cost of the call |
| compliance | object | No | Compliance information |
| transcript | string | Yes | Full transcript of the call |
| recordingUrl | string | No | URL to the call recording |
| summary | string | Yes | Summary of the call |
| structuredData | object | Yes | Structured analysis data |
| successEvaluation | object | Yes | Evaluation of call success |
| duration | number | Yes | Duration of call in seconds |
| metadata | object | No | Metadata from the original call |

### Compliance Object
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| pii | object | No | PII compliance data |
| pci | object | No | PCI compliance data |

### PII/PCI Objects
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| violations | array | No | List of compliance violations |

### Structured Data Object
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| categories | array | Yes | Performance categories with scores |
| strengths | array | Yes | List of strengths identified |
| improvements | array | Yes | List of areas for improvement |
| recommendations | array | Yes | List of recommendations |

### Success Evaluation Object
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| score | number | Yes | Overall score (0-100) |
| passed | boolean | Yes | Whether the evaluation passed |

### Metadata Object
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| studentId | string | No | ID of the student (if authenticated) |
| departmentId | string | No | ID of the department |
| institutionId | string | No | ID of the institution |
| interviewType | string | No | Type of interview |

## Example Request Body

```json
{
  "message": {
    "type": "end-of-call-report",
    "callId": "call_1234567890",
    "startedAt": "2025-10-10T10:00:00.000Z",
    "endedAt": "2025-10-10T10:15:00.000Z",
    "endedReason": "customer-ended-call",
    "cost": 0.05,
    "compliance": {
      "pii": {
        "violations": []
      },
      "pci": {
        "violations": []
      }
    },
    "transcript": "User: Hello, I'm excited to be here for this interview.\nAssistant: Great! Let's start with a simple question. Can you tell me about yourself?",
    "recordingUrl": "https://example.com/recording/call_1234567890.mp3",
    "summary": "The candidate showed enthusiasm for the position and was able to provide a basic introduction about themselves.",
    "structuredData": {
      "categories": [
        {
          "name": "Communication",
          "score": 85,
          "weight": 0.3
        },
        {
          "name": "Enthusiasm",
          "score": 90,
          "weight": 0.2
        },
        {
          "name": "Introduction",
          "score": 75,
          "weight": 0.5
        }
      ],
      "strengths": [
        "Enthusiasm",
        "Clear communication"
      ],
      "improvements": [
        "Provide more detailed introduction",
        "Mention specific experiences"
      ],
      "recommendations": [
        "Practice more detailed self-introductions",
        "Prepare specific examples"
      ]
    },
    "successEvaluation": {
      "score": 83,
      "passed": true
    },
    "duration": 900,
    "metadata": {
      "studentId": "student_123",
      "departmentId": "dept_cs_456",
      "institutionId": "inst_university_789",
      "interviewType": "general"
    }
  }
}
```

## Validation Rules

1. **Required Fields**: The following fields are required in every webhook request:
   - `message.type`
   - `message.callId`
   - `message.startedAt`
   - `message.endedAt`
   - `message.endedReason`
   - `message.cost`
   - `message.transcript`
   - `message.summary`
   - `message.structuredData`
   - `message.successEvaluation`
   - `message.duration`

2. **Data Types**: All fields must match their specified data types.

3. **Score Range**: All score values must be between 0 and 100.

4. **Timestamp Format**: All timestamp fields must be in ISO 8601 format.

5. **Metadata Handling**: Metadata fields are optional but when present, they should be used for data isolation in Firestore.