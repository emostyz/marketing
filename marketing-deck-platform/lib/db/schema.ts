import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  jsonb,
  uuid,
  boolean,
  pgEnum
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ============ EXISTING TABLES ============
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  phone: varchar('phone', { length: 30 }),
  company: varchar('company', { length: 100 }),
  jobTitle: varchar('job_title', { length: 100 }),
  goals: text('goals'),
  datasetTypes: text('dataset_types'),
  usagePlan: text('usage_plan'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const dataLibrary = pgTable('data_library', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  fileName: varchar('file_name', { length: 255 }),
  fileType: varchar('file_type', { length: 50 }),
  analysisSummary: text('analysis_summary'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const deckDrafts = pgTable('deck_drafts', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  slides: jsonb('slides').notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const decks = pgTable('decks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),
  slides: jsonb('slides').notNull(),
  exportInfo: jsonb('export_info'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pptxTemplates = pgTable('pptx_templates', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  fileName: varchar('file_name', { length: 255 }),
  fileType: varchar('file_type', { length: 50 }),
  fileUrl: text('file_url'),
  metadata: jsonb('metadata'),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
});

// ============ NEW BUSINESS PLAN TABLES ============

// Enums for new tables
export const presentationStatusEnum = pgEnum('presentation_status', ['draft', 'processing', 'completed', 'error']);
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['starter', 'professional', 'enterprise']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'canceled', 'past_due']);

// Profiles table (for Supabase auth integration)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull(),
  name: text('name'),
  profilePictureUrl: text('profile_picture_url'),
  bio: text('bio'),
  companyName: text('company_name'),
  jobTitle: text('job_title'),
  phone: text('phone'),
  logoUrl: text('logo_url'),
  brandColors: jsonb('brand_colors'),
  industry: text('industry'),
  targetAudience: text('target_audience'),
  businessContext: text('business_context'),
  businessGoals: jsonb('business_goals'),
  keyQuestions: jsonb('key_questions'),
  keyMetrics: jsonb('key_metrics'),
  datasetTypes: jsonb('dataset_types'),
  usagePlan: text('usage_plan'),
  presentationStyle: text('presentation_style'),
  dataPreferences: jsonb('data_preferences'),
  customRequirements: text('custom_requirements'),
  onboardingCompleted: boolean('onboarding_completed').default(false),
  masterSystemPrompt: text('master_system_prompt'),
  subscriptionPlan: subscriptionPlanEnum('subscription_plan').default('starter'),
  presentationsUsedThisMonth: integer('presentations_used_this_month').default(0),
  monthlyResetDate: timestamp('monthly_reset_date', { withTimezone: true }).defaultNow(),
  stripeCustomerId: text('stripe_customer_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Presentations table (already exists in your Supabase)
export const presentations = pgTable('presentations', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('draft'),
  templateId: text('template_id'),
  slides: jsonb('slides').default([]),
  finalDeckJson: jsonb('final_deck_json'),
  errorMessage: text('error_message'),
  dataSources: jsonb('data_sources').default([]),
  narrativeConfig: jsonb('narrative_config').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
});

// Templates table
export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  previewImageUrl: text('preview_image_url'),
  structure: jsonb('structure'),
  tags: text('tags').array(),
  isPublic: boolean('is_public').default(true),
  createdBy: uuid('created_by').references(() => profiles.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Data imports table for file uploads
export const dataImports = pgTable('data_imports', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: integer('file_size'),
  folder: text('folder'),
  storagePath: text('storage_path').notNull(),
  publicUrl: text('public_url'),
  rawData: jsonb('raw_data'),
  pptxStructure: jsonb('pptx_structure'),
  status: text('status').default('pending'),
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).defaultNow().notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true })
});

// Datasets table for processed data storage
export const datasets = pgTable('datasets', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  name: text('name').notNull(),
  originalFileUrl: text('original_file_url'),
  processedData: jsonb('processed_data'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Data columns table for column metadata
export const dataColumns = pgTable('data_columns', {
  id: uuid('id').primaryKey().defaultRandom(),
  datasetId: uuid('dataset_id').notNull().references(() => datasets.id),
  columnName: text('column_name').notNull(),
  dataType: text('data_type').notNull(),
  sampleValues: jsonb('sample_values'),
  statistics: jsonb('statistics')
});

// Presentation Events table
export const presentationEvents = pgTable('presentation_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => profiles.id),
  presentationId: uuid('presentation_id').references(() => presentations.id),
  eventType: text('event_type'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// Subscriptions table (business plan version)
export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => profiles.id),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  planName: subscriptionPlanEnum('plan_name').notNull(),
  status: subscriptionStatusEnum('status'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

// ============ RELATIONS ============

// Existing relations
export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

// New relations for business plan tables
export const profilesRelations = relations(profiles, ({ many }) => ({
  presentations: many(presentations),
  templates: many(templates),
  events: many(presentationEvents),
  subscriptions: many(subscriptions),
  datasets: many(datasets)
}));

export const datasetsRelations = relations(datasets, ({ one, many }) => ({
  user: one(profiles, {
    fields: [datasets.userId],
    references: [profiles.id]
  }),
  columns: many(dataColumns)
}));

export const dataColumnsRelations = relations(dataColumns, ({ one }) => ({
  dataset: one(datasets, {
    fields: [dataColumns.datasetId],
    references: [datasets.id]
  })
}));

export const presentationsRelations = relations(presentations, ({ one, many }) => ({
  user: one(profiles, {
    fields: [presentations.userId],
    references: [profiles.id]
  }),
  events: many(presentationEvents)
}));

// ============ TYPE EXPORTS ============

// Existing types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

// New types for business plan
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Presentation = typeof presentations.$inferSelect;
export type NewPresentation = typeof presentations.$inferInsert;
export type Template = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;
export type DataImport = typeof dataImports.$inferSelect;
export type NewDataImport = typeof dataImports.$inferInsert;
export type Dataset = typeof datasets.$inferSelect;
export type NewDataset = typeof datasets.$inferInsert;
export type DataColumn = typeof dataColumns.$inferSelect;
export type NewDataColumn = typeof dataColumns.$inferInsert;
export type PresentationEvent = typeof presentationEvents.$inferSelect;
export type NewPresentationEvent = typeof presentationEvents.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
}