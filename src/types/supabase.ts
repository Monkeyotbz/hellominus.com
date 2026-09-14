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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accommodation_features: {
        Row: {
          accommodation_id: string
          feature_id: string
        }
        Insert: {
          accommodation_id: string
          feature_id: string
        }
        Update: {
          accommodation_id?: string
          feature_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_features_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accommodation_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodation_images: {
        Row: {
          accommodation_id: string
          alt: Json
          created_at: string
          id: string
          is_cover: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          accommodation_id: string
          alt?: Json
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          accommodation_id?: string
          alt?: Json
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodation_images_accommodation_id_fkey"
            columns: ["accommodation_id"]
            isOneToOne: false
            referencedRelation: "accommodations"
            referencedColumns: ["id"]
          },
        ]
      }
      accommodations: {
        Row: {
          address: string | null
          bathrooms: number | null
          bedrooms: number | null
          beds: number | null
          check_in_time: string | null
          check_out_time: string | null
          city: string | null
          country: string
          created_at: string
          created_by: string | null
          currency: string
          description: Json
          destination_id: string | null
          external_booking_url: string | null
          external_platform: string | null
          featured: boolean
          id: string
          latitude: number | null
          location_note: Json
          longitude: number | null
          max_guests: number | null
          meta_description: Json
          meta_title: Json
          name: Json
          price_from: number | null
          region: string | null
          slug: string
          slug_aliases: string[]
          sort_order: number
          status: string
          summary: Json
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          beds?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          external_booking_url?: string | null
          external_platform?: string | null
          featured?: boolean
          id?: string
          latitude?: number | null
          location_note?: Json
          longitude?: number | null
          max_guests?: number | null
          meta_description?: Json
          meta_title?: Json
          name?: Json
          price_from?: number | null
          region?: string | null
          slug: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          summary?: Json
          type?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          beds?: number | null
          check_in_time?: string | null
          check_out_time?: string | null
          city?: string | null
          country?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          external_booking_url?: string | null
          external_platform?: string | null
          featured?: boolean
          id?: string
          latitude?: number | null
          location_note?: Json
          longitude?: number | null
          max_guests?: number | null
          meta_description?: Json
          meta_title?: Json
          name?: Json
          price_from?: number | null
          region?: string | null
          slug?: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          summary?: Json
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accommodations_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_categories: {
        Row: {
          created_at: string
          id: string
          name: Json
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name?: Json
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: Json
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          body: Json
          category_id: string | null
          cover_image_path: string | null
          created_at: string
          created_by: string | null
          excerpt: Json
          featured: boolean
          id: string
          meta_description: Json
          meta_title: Json
          published_at: string | null
          reading_minutes: number | null
          slug: string
          slug_aliases: string[]
          status: string
          tags: string[]
          title: Json
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: Json
          category_id?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: Json
          featured?: boolean
          id?: string
          meta_description?: Json
          meta_title?: Json
          published_at?: string | null
          reading_minutes?: number | null
          slug: string
          slug_aliases?: string[]
          status?: string
          tags?: string[]
          title?: Json
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: Json
          category_id?: string | null
          cover_image_path?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: Json
          featured?: boolean
          id?: string
          meta_description?: Json
          meta_title?: Json
          published_at?: string | null
          reading_minutes?: number | null
          slug?: string
          slug_aliases?: string[]
          status?: string
          tags?: string[]
          title?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "blog_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_documents: {
        Row: {
          booking_id: string
          created_at: string
          id: string
          kind: string
          label: string | null
          storage_path: string
          visible_to_client: boolean
        }
        Insert: {
          booking_id: string
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          storage_path: string
          visible_to_client?: boolean
        }
        Update: {
          booking_id?: string
          created_at?: string
          id?: string
          kind?: string
          label?: string | null
          storage_path?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "booking_documents_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_events: {
        Row: {
          body: Json
          booking_id: string
          created_at: string
          created_by: string | null
          created_by_role: string
          id: string
          title: Json
          type: string
          visible_to_client: boolean
        }
        Insert: {
          body?: Json
          booking_id: string
          created_at?: string
          created_by?: string | null
          created_by_role?: string
          id?: string
          title?: Json
          type?: string
          visible_to_client?: boolean
        }
        Update: {
          body?: Json
          booking_id?: string
          created_at?: string
          created_by?: string | null
          created_by_role?: string
          id?: string
          title?: Json
          type?: string
          visible_to_client?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "booking_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          contact_email: string | null
          contact_name: string | null
          contact_whatsapp: string | null
          created_at: string
          crm_id: string | null
          currency: string
          end_date: string | null
          guests: number | null
          id: string
          item_id: string | null
          item_title_snapshot: string | null
          item_type: string | null
          lead_id: string | null
          notes: string | null
          paid_amount: number
          pax_detail: Json
          payment_status: string
          reference: string
          source: string | null
          start_date: string | null
          status: string
          total_amount: number | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contact_email?: string | null
          contact_name?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          crm_id?: string | null
          currency?: string
          end_date?: string | null
          guests?: number | null
          id?: string
          item_id?: string | null
          item_title_snapshot?: string | null
          item_type?: string | null
          lead_id?: string | null
          notes?: string | null
          paid_amount?: number
          pax_detail?: Json
          payment_status?: string
          reference?: string
          source?: string | null
          start_date?: string | null
          status?: string
          total_amount?: number | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contact_email?: string | null
          contact_name?: string | null
          contact_whatsapp?: string | null
          created_at?: string
          crm_id?: string | null
          currency?: string
          end_date?: string | null
          guests?: number | null
          id?: string
          item_id?: string | null
          item_title_snapshot?: string | null
          item_type?: string | null
          lead_id?: string | null
          notes?: string | null
          paid_amount?: number
          pax_detail?: Json
          payment_status?: string
          reference?: string
          source?: string | null
          start_date?: string | null
          status?: string
          total_amount?: number | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      destination_images: {
        Row: {
          alt: Json
          created_at: string
          credit: string | null
          destination_id: string
          id: string
          is_cover: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt?: Json
          created_at?: string
          credit?: string | null
          destination_id: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt?: Json
          created_at?: string
          credit?: string | null
          destination_id?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "destination_images_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          best_time: Json
          country: string
          created_at: string
          created_by: string | null
          description: Json
          featured: boolean
          hero_image_path: string | null
          highlights: Json
          id: string
          latitude: number | null
          longitude: number | null
          meta_description: Json
          meta_title: Json
          name: Json
          region: string | null
          slug: string
          slug_aliases: string[]
          sort_order: number
          status: string
          tagline: Json
          updated_at: string
        }
        Insert: {
          best_time?: Json
          country?: string
          created_at?: string
          created_by?: string | null
          description?: Json
          featured?: boolean
          hero_image_path?: string | null
          highlights?: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: Json
          meta_title?: Json
          name?: Json
          region?: string | null
          slug: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          tagline?: Json
          updated_at?: string
        }
        Update: {
          best_time?: Json
          country?: string
          created_at?: string
          created_by?: string | null
          description?: Json
          featured?: boolean
          hero_image_path?: string | null
          highlights?: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          meta_description?: Json
          meta_title?: Json
          name?: Json
          region?: string | null
          slug?: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          tagline?: Json
          updated_at?: string
        }
        Relationships: []
      }
      event_images: {
        Row: {
          alt: Json
          created_at: string
          event_id: string
          id: string
          is_cover: boolean
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt?: Json
          created_at?: string
          event_id: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt?: Json
          created_at?: string
          event_id?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_images_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          city: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: Json
          destination_id: string | null
          end_date: string | null
          featured: boolean
          id: string
          is_recurring: boolean
          meta_description: Json
          meta_title: Json
          month_label: Json
          name: Json
          price_from: number | null
          region: string | null
          slug: string
          slug_aliases: string[]
          sort_order: number
          start_date: string | null
          status: string
          ticket_url: string | null
          updated_at: string
          venue: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          end_date?: string | null
          featured?: boolean
          id?: string
          is_recurring?: boolean
          meta_description?: Json
          meta_title?: Json
          month_label?: Json
          name?: Json
          price_from?: number | null
          region?: string | null
          slug: string
          slug_aliases?: string[]
          sort_order?: number
          start_date?: string | null
          status?: string
          ticket_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          end_date?: string | null
          featured?: boolean
          id?: string
          is_recurring?: boolean
          meta_description?: Json
          meta_title?: Json
          month_label?: Json
          name?: Json
          price_from?: number | null
          region?: string | null
          slug?: string
          slug_aliases?: string[]
          sort_order?: number
          start_date?: string | null
          status?: string
          ticket_url?: string | null
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          kind: string
          label: Json
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          kind?: string
          label?: Json
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          kind?: string
          label?: Json
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          budget: number | null
          check_in: string | null
          check_out: string | null
          created_at: string
          crm_id: string | null
          currency: string | null
          email: string | null
          guests: number | null
          id: string
          ip: unknown
          landing_path: string | null
          locale: string | null
          message: string | null
          name: string | null
          preferred_dates_note: string | null
          raw: Json
          referrer: string | null
          related_id: string | null
          related_type: string | null
          source: string | null
          status: string
          synced_at: string | null
          synced_to_crm: boolean
          type: string
          updated_at: string
          user_agent: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
          whatsapp: string | null
        }
        Insert: {
          assigned_to?: string | null
          budget?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          crm_id?: string | null
          currency?: string | null
          email?: string | null
          guests?: number | null
          id?: string
          ip?: unknown
          landing_path?: string | null
          locale?: string | null
          message?: string | null
          name?: string | null
          preferred_dates_note?: string | null
          raw?: Json
          referrer?: string | null
          related_id?: string | null
          related_type?: string | null
          source?: string | null
          status?: string
          synced_at?: string | null
          synced_to_crm?: boolean
          type?: string
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string | null
        }
        Update: {
          assigned_to?: string | null
          budget?: number | null
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          crm_id?: string | null
          currency?: string | null
          email?: string | null
          guests?: number | null
          id?: string
          ip?: unknown
          landing_path?: string | null
          locale?: string | null
          message?: string | null
          name?: string | null
          preferred_dates_note?: string | null
          raw?: Json
          referrer?: string | null
          related_id?: string | null
          related_type?: string | null
          source?: string | null
          status?: string
          synced_at?: string | null
          synced_to_crm?: boolean
          type?: string
          updated_at?: string
          user_agent?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      locales: {
        Row: {
          code: string
          created_at: string
          flag_emoji: string | null
          is_active: boolean
          is_default: boolean
          name: string
          native_name: string | null
          sort_order: number
        }
        Insert: {
          code: string
          created_at?: string
          flag_emoji?: string | null
          is_active?: boolean
          is_default?: boolean
          name: string
          native_name?: string | null
          sort_order?: number
        }
        Update: {
          code?: string
          created_at?: string
          flag_emoji?: string | null
          is_active?: boolean
          is_default?: boolean
          name?: string
          native_name?: string | null
          sort_order?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmed_at: string | null
          consent_at: string | null
          created_at: string
          email: string
          external_id: string | null
          external_provider: string | null
          id: string
          landing_path: string | null
          locale: string | null
          name: string | null
          source: string | null
          status: string
          unsubscribed_at: string | null
          updated_at: string
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          confirmed_at?: string | null
          consent_at?: string | null
          created_at?: string
          email: string
          external_id?: string | null
          external_provider?: string | null
          id?: string
          landing_path?: string | null
          locale?: string | null
          name?: string | null
          source?: string | null
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          confirmed_at?: string | null
          consent_at?: string | null
          created_at?: string
          email?: string
          external_id?: string | null
          external_provider?: string | null
          id?: string
          landing_path?: string | null
          locale?: string | null
          name?: string | null
          source?: string | null
          status?: string
          unsubscribed_at?: string | null
          updated_at?: string
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_path: string | null
          city: string | null
          country: string | null
          created_at: string
          document_number: string | null
          document_type: string | null
          full_name: string | null
          id: string
          locale: string
          marketing_opt_in: boolean
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_path?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          full_name?: string | null
          id: string
          locale?: string
          marketing_opt_in?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_path?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document_number?: string | null
          document_type?: string | null
          full_name?: string | null
          id?: string
          locale?: string
          marketing_opt_in?: boolean
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_locale_fkey"
            columns: ["locale"]
            isOneToOne: false
            referencedRelation: "locales"
            referencedColumns: ["code"]
          },
        ]
      }
      real_estate_listing_features: {
        Row: {
          feature_id: string
          listing_id: string
        }
        Insert: {
          feature_id: string
          listing_id: string
        }
        Update: {
          feature_id?: string
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_estate_listing_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "real_estate_listing_features_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "real_estate_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_listing_images: {
        Row: {
          alt: Json
          created_at: string
          id: string
          is_cover: boolean
          listing_id: string
          sort_order: number
          storage_path: string
        }
        Insert: {
          alt?: Json
          created_at?: string
          id?: string
          is_cover?: boolean
          listing_id: string
          sort_order?: number
          storage_path: string
        }
        Update: {
          alt?: Json
          created_at?: string
          id?: string
          is_cover?: boolean
          listing_id?: string
          sort_order?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_estate_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "real_estate_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_listings: {
        Row: {
          address: string | null
          allows_pets: boolean
          area_built_m2: number | null
          area_total_m2: number | null
          availability: string
          bathrooms: number | null
          bedrooms: number | null
          city: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: Json
          destination_id: string | null
          featured: boolean
          floor: number | null
          floors_total: number | null
          half_bathrooms: number | null
          hide_exact_location: boolean
          hoa_fee: number | null
          id: string
          is_furnished: boolean
          latitude: number | null
          longitude: number | null
          meta_description: Json
          meta_title: Json
          neighborhood: string | null
          operation: string
          parking_spaces: number | null
          price: number | null
          price_period: string | null
          property_type: string
          reference_code: string | null
          region: string | null
          slug: string
          slug_aliases: string[]
          sort_order: number
          status: string
          stratum: number | null
          title: Json
          updated_at: string
          year_built: number | null
        }
        Insert: {
          address?: string | null
          allows_pets?: boolean
          area_built_m2?: number | null
          area_total_m2?: number | null
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          featured?: boolean
          floor?: number | null
          floors_total?: number | null
          half_bathrooms?: number | null
          hide_exact_location?: boolean
          hoa_fee?: number | null
          id?: string
          is_furnished?: boolean
          latitude?: number | null
          longitude?: number | null
          meta_description?: Json
          meta_title?: Json
          neighborhood?: string | null
          operation?: string
          parking_spaces?: number | null
          price?: number | null
          price_period?: string | null
          property_type?: string
          reference_code?: string | null
          region?: string | null
          slug: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          stratum?: number | null
          title?: Json
          updated_at?: string
          year_built?: number | null
        }
        Update: {
          address?: string | null
          allows_pets?: boolean
          area_built_m2?: number | null
          area_total_m2?: number | null
          availability?: string
          bathrooms?: number | null
          bedrooms?: number | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          featured?: boolean
          floor?: number | null
          floors_total?: number | null
          half_bathrooms?: number | null
          hide_exact_location?: boolean
          hoa_fee?: number | null
          id?: string
          is_furnished?: boolean
          latitude?: number | null
          longitude?: number | null
          meta_description?: Json
          meta_title?: Json
          neighborhood?: string | null
          operation?: string
          parking_spaces?: number | null
          price?: number | null
          price_period?: string | null
          property_type?: string
          reference_code?: string | null
          region?: string | null
          slug?: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          stratum?: number | null
          title?: Json
          updated_at?: string
          year_built?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "real_estate_listings_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          author_location: string | null
          author_name: string
          avatar_path: string | null
          created_at: string
          created_by: string | null
          featured: boolean
          id: string
          quote: Json
          rating: number | null
          related_id: string | null
          related_type: string | null
          sort_order: number
          source: string | null
          status: string
          updated_at: string
        }
        Insert: {
          author_location?: string | null
          author_name: string
          avatar_path?: string | null
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          quote?: Json
          rating?: number | null
          related_id?: string | null
          related_type?: string | null
          sort_order?: number
          source?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          author_location?: string | null
          author_name?: string
          avatar_path?: string | null
          created_at?: string
          created_by?: string | null
          featured?: boolean
          id?: string
          quote?: Json
          rating?: number | null
          related_id?: string | null
          related_type?: string | null
          sort_order?: number
          source?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      tour_features: {
        Row: {
          feature_id: string
          tour_id: string
        }
        Insert: {
          feature_id: string
          tour_id: string
        }
        Update: {
          feature_id?: string
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_features_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tour_features_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tour_images: {
        Row: {
          alt: Json
          created_at: string
          id: string
          is_cover: boolean
          sort_order: number
          storage_path: string
          tour_id: string
        }
        Insert: {
          alt?: Json
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path: string
          tour_id: string
        }
        Update: {
          alt?: Json
          created_at?: string
          id?: string
          is_cover?: boolean
          sort_order?: number
          storage_path?: string
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tour_images_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "tours"
            referencedColumns: ["id"]
          },
        ]
      }
      tours: {
        Row: {
          category: string | null
          city: string | null
          created_at: string
          created_by: string | null
          currency: string
          description: Json
          destination_id: string | null
          difficulty: string | null
          duration_hours: number | null
          duration_label: Json
          excluded: Json
          featured: boolean
          id: string
          itinerary: Json
          max_pax: number | null
          meeting_point: string | null
          meta_description: Json
          meta_title: Json
          min_pax: number | null
          name: Json
          price_from: number | null
          region: string | null
          schedule_label: Json
          slug: string
          slug_aliases: string[]
          sort_order: number
          status: string
          summary: Json
          updated_at: string
        }
        Insert: {
          category?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          duration_label?: Json
          excluded?: Json
          featured?: boolean
          id?: string
          itinerary?: Json
          max_pax?: number | null
          meeting_point?: string | null
          meta_description?: Json
          meta_title?: Json
          min_pax?: number | null
          name?: Json
          price_from?: number | null
          region?: string | null
          schedule_label?: Json
          slug: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          summary?: Json
          updated_at?: string
        }
        Update: {
          category?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          description?: Json
          destination_id?: string | null
          difficulty?: string | null
          duration_hours?: number | null
          duration_label?: Json
          excluded?: Json
          featured?: boolean
          id?: string
          itinerary?: Json
          max_pax?: number | null
          meeting_point?: string | null
          meta_description?: Json
          meta_title?: Json
          min_pax?: number | null
          name?: Json
          price_from?: number | null
          region?: string | null
          schedule_label?: Json
          slug?: string
          slug_aliases?: string[]
          sort_order?: number
          status?: string
          summary?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tours_destination_id_fkey"
            columns: ["destination_id"]
            isOneToOne: false
            referencedRelation: "destinations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      _catalog_rls: { Args: { p_table: string }; Returns: undefined }
      _child_rls: {
        Args: { p_fk: string; p_parent: string; p_table: string }
        Returns: undefined
      }
      i18n_text: {
        Args: { data: Json; fallback?: string; locale: string }
        Returns: string
      }
      is_admin: { Args: never; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
