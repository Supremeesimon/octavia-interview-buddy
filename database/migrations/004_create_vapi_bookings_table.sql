CREATE TABLE IF NOT EXISTS vapi_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email CITEXT NOT NULL,
    scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    role VARCHAR(100),
    assistant VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_vapi_bookings_email ON vapi_bookings(email);
CREATE INDEX idx_vapi_bookings_scheduled_at ON vapi_bookings(scheduled_at);
