export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          admin_notes: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          email: string | null
          full_name: string
          id: string
          location: string | null
          phone: string
          reference: string
          scheduled_date: string
          scheduled_time: string
          service_id: string | null
          status: string
          technician_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          email?: string | null
          full_name: string
          id?: string
          location?: string | null
          phone: string
          reference?: string
          scheduled_date: string
          scheduled_time: string
          service_id?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          email?: string | null
          full_name?: string
          id?: string
          location?: string | null
          phone?: string
          reference?: string
          scheduled_date?: string
          scheduled_time?: string
          service_id?: string | null
          status?: string
          technician_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      business_settings: {
        Row: {
          about_text: string | null
          address: string | null
          company_name: string
          created_at: string
          email: string | null
          emergency_message: string | null
          facebook_url: string | null
          footer_text: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          payment_instructions: string | null
          phone: string | null
          privacy_text: string | null
          tagline: string
          terms_text: string | null
          tiktok_url: string | null
          updated_at: string
          whatsapp: string | null
          working_hours: string | null
          x_url: string | null
        }
        Insert: {
          about_text?: string | null
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          emergency_message?: string | null
          facebook_url?: string | null
          footer_text?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          payment_instructions?: string | null
          phone?: string | null
          privacy_text?: string | null
          tagline?: string
          terms_text?: string | null
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          working_hours?: string | null
          x_url?: string | null
        }
        Update: {
          about_text?: string | null
          address?: string | null
          company_name?: string
          created_at?: string
          email?: string | null
          emergency_message?: string | null
          facebook_url?: string | null
          footer_text?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          payment_instructions?: string | null
          phone?: string | null
          privacy_text?: string | null
          tagline?: string
          terms_text?: string | null
          tiktok_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          working_hours?: string | null
          x_url?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          customer_number: string
          email: string | null
          full_name: string
          id: string
          is_demo: boolean
          location: string | null
          notes: string | null
          phone: string | null
          profile_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          customer_number: string
          email?: string | null
          full_name: string
          id?: string
          is_demo?: boolean
          location?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          customer_number?: string
          email?: string | null
          full_name?: string
          id?: string
          is_demo?: boolean
          location?: string | null
          notes?: string | null
          phone?: string | null
          profile_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      doc_counters: {
        Row: {
          current: number
          prefix: string
          year: number
        }
        Insert: {
          current?: number
          prefix: string
          year: number
        }
        Update: {
          current?: number
          prefix?: string
          year?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          content: Json | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          doc_type: string
          file_url: string | null
          id: string
          job_id: string | null
          title: string
        }
        Insert: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          doc_type: string
          file_url?: string | null
          id?: string
          job_id?: string | null
          title: string
        }
        Update: {
          content?: Json | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          doc_type?: string
          file_url?: string | null
          id?: string
          job_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      enquiries: {
        Row: {
          admin_notes: string | null
          attachments: Json
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string | null
          email: string | null
          full_name: string
          id: string
          location: string | null
          phone: string
          preferred_date: string | null
          preferred_time: string | null
          property_type: string | null
          reference: string
          service_id: string | null
          service_other: string | null
          status: string
          updated_at: string
          urgency: string
          whatsapp: string | null
        }
        Insert: {
          admin_notes?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          email?: string | null
          full_name: string
          id?: string
          location?: string | null
          phone: string
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: string | null
          reference?: string
          service_id?: string | null
          service_other?: string | null
          status?: string
          updated_at?: string
          urgency?: string
          whatsapp?: string | null
        }
        Update: {
          admin_notes?: string | null
          attachments?: Json
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          email?: string | null
          full_name?: string
          id?: string
          location?: string | null
          phone?: string
          preferred_date?: string | null
          preferred_time?: string | null
          property_type?: string | null
          reference?: string
          service_id?: string | null
          service_other?: string | null
          status?: string
          updated_at?: string
          urgency?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "enquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enquiries_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      faqs: {
        Row: {
          answer: string
          created_at: string
          id: string
          is_active: boolean
          question: string
          service_id: string | null
          sort_order: number
        }
        Insert: {
          answer: string
          created_at?: string
          id?: string
          is_active?: boolean
          question: string
          service_id?: string | null
          sort_order?: number
        }
        Update: {
          answer?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question?: string
          service_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "faqs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          description: string
          id: string
          invoice_id: string
          quantity: number
          sort_order: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          invoice_id: string
          quantity?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          invoice_id?: string
          quantity?: number
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_paid: number
          created_at: string
          customer_id: string
          discount: number
          due_date: string | null
          id: string
          issue_date: string
          job_id: string | null
          notes: string | null
          quote_id: string | null
          reference: string
          status: string
          subtotal: number
          tax_rate: number
          terms: string | null
          total: number
          updated_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          customer_id: string
          discount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          job_id?: string | null
          notes?: string | null
          quote_id?: string | null
          reference?: string
          status?: string
          subtotal?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          customer_id?: string
          discount?: number
          due_date?: string | null
          id?: string
          issue_date?: string
          job_id?: string | null
          notes?: string | null
          quote_id?: string | null
          reference?: string
          status?: string
          subtotal?: number
          tax_rate?: number
          terms?: string | null
          total?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_materials: {
        Row: {
          created_at: string
          id: string
          job_id: string
          name: string
          quantity: number
          unit: string | null
          unit_cost: number
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          name: string
          quantity?: number
          unit?: string | null
          unit_cost?: number
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          name?: string
          quantity?: number
          unit?: string | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "job_materials_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          is_internal: boolean
          job_id: string
          note: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          is_internal?: boolean
          job_id: string
          note: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          is_internal?: boolean
          job_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          job_id: string
          stage: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          job_id: string
          stage?: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          job_id?: string
          stage?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          booking_id: string | null
          completed_at: string | null
          created_at: string
          customer_id: string
          customer_signature: string | null
          description: string | null
          enquiry_id: string | null
          expected_completion: string | null
          id: string
          location: string | null
          notes: string | null
          reference: string
          service_id: string | null
          start_date: string | null
          status: string
          technician_id: string | null
          title: string
          updated_at: string
          work_summary: string | null
        }
        Insert: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id: string
          customer_signature?: string | null
          description?: string | null
          enquiry_id?: string | null
          expected_completion?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          reference?: string
          service_id?: string | null
          start_date?: string | null
          status?: string
          technician_id?: string | null
          title: string
          updated_at?: string
          work_summary?: string | null
        }
        Update: {
          booking_id?: string | null
          completed_at?: string | null
          created_at?: string
          customer_id?: string
          customer_signature?: string | null
          description?: string | null
          enquiry_id?: string | null
          expected_completion?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          reference?: string
          service_id?: string | null
          start_date?: string | null
          status?: string
          technician_id?: string | null
          title?: string
          updated_at?: string
          work_summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          audience: string
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          audience?: string
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          customer_id: string
          external_reference: string | null
          id: string
          invoice_id: string | null
          method: string
          notes: string | null
          paid_at: string | null
          reference: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id: string
          external_reference?: string | null
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          paid_at?: string | null
          reference?: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string
          external_reference?: string | null
          id?: string
          invoice_id?: string | null
          method?: string
          notes?: string | null
          paid_at?: string | null
          reference?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      project_images: {
        Row: {
          caption: string | null
          created_at: string
          id: string
          image_url: string
          project_id: string
          sort_order: number
          stage: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url: string
          project_id: string
          sort_order?: number
          stage?: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          id?: string
          image_url?: string
          project_id?: string
          sort_order?: number
          stage?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          category: string | null
          completed_on: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_demo: boolean
          is_published: boolean
          location: string | null
          services_performed: string[] | null
          slug: string
          testimonial: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          completed_on?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          is_published?: boolean
          location?: string | null
          services_performed?: string[] | null
          slug: string
          testimonial?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          completed_on?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_demo?: boolean
          is_published?: boolean
          location?: string | null
          services_performed?: string[] | null
          slug?: string
          testimonial?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      quote_items: {
        Row: {
          description: string
          id: string
          quantity: number
          quote_id: string
          sort_order: number
          unit: string | null
          unit_price: number
        }
        Insert: {
          description: string
          id?: string
          quantity?: number
          quote_id: string
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Update: {
          description?: string
          id?: string
          quantity?: number
          quote_id?: string
          sort_order?: number
          unit?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          customer_id: string
          description: string | null
          discount: number
          enquiry_id: string | null
          id: string
          job_id: string | null
          labour_cost: number
          other_charges: number
          reference: string
          responded_at: string | null
          status: string
          tax_rate: number
          terms: string | null
          title: string
          total: number
          transport_cost: number
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          customer_id: string
          description?: string | null
          discount?: number
          enquiry_id?: string | null
          id?: string
          job_id?: string | null
          labour_cost?: number
          other_charges?: number
          reference?: string
          responded_at?: string | null
          status?: string
          tax_rate?: number
          terms?: string | null
          title: string
          total?: number
          transport_cost?: number
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string
          description?: string | null
          discount?: number
          enquiry_id?: string | null
          id?: string
          job_id?: string | null
          labour_cost?: number
          other_charges?: number
          reference?: string
          responded_at?: string | null
          status?: string
          tax_rate?: number
          terms?: string | null
          title?: string
          total?: number
          transport_cost?: number
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "quotes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_enquiry_id_fkey"
            columns: ["enquiry_id"]
            isOneToOne: false
            referencedRelation: "enquiries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      receipts: {
        Row: {
          amount: number
          customer_id: string
          id: string
          invoice_id: string | null
          issued_at: string
          payment_id: string
          reference: string
        }
        Insert: {
          amount: number
          customer_id: string
          id?: string
          invoice_id?: string | null
          issued_at?: string
          payment_id: string
          reference?: string
        }
        Update: {
          amount?: number
          customer_id?: string
          id?: string
          invoice_id?: string | null
          issued_at?: string
          payment_id?: string
          reference?: string
        }
        Relationships: [
          {
            foreignKeyName: "receipts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "receipts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          author_name: string
          body: string | null
          created_at: string
          customer_id: string | null
          id: string
          is_demo: boolean
          job_id: string | null
          photo_url: string | null
          rating: number
          service_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          author_name: string
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_demo?: boolean
          job_id?: string | null
          photo_url?: string | null
          rating: number
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          author_name?: string
          body?: string | null
          created_at?: string
          customer_id?: string | null
          id?: string
          is_demo?: boolean
          job_id?: string | null
          photo_url?: string | null
          rating?: number
          service_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_areas: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          price_public: boolean
          pricing_type: string
          short_description: string | null
          slug: string
          sort_order: number
          starting_price: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          price_public?: boolean
          pricing_type?: string
          short_description?: string | null
          slug: string
          sort_order?: number
          starting_price?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          price_public?: boolean
          pricing_type?: string
          short_description?: string | null
          slug?: string
          sort_order?: number
          starting_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          profile_id: string | null
          specialty: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          profile_id?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          profile_id?: string | null
          specialty?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_customer_id: { Args: never; Returns: string }
      current_technician_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      next_doc_number: { Args: { _prefix: string }; Returns: string }
    }
    Enums: {
      app_role: "owner" | "admin" | "technician" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["owner", "admin", "technician", "customer"],
    },
  },
} as const
