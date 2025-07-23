-- Fix RLS policies: ensure all comparisons to auth.uid() use ::uuid

-- chat_channels
DROP POLICY IF EXISTS "Allow users to view channels they are members of" ON chat_channels;
CREATE POLICY "Allow users to view channels they are members of"
  ON chat_channels
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE chat_channel_members.channel_id = chat_channels.id AND chat_channel_members.user_id = auth.uid()::uuid));

DROP POLICY IF EXISTS "Allow channel owners and admins to update channels" ON chat_channels;
CREATE POLICY "Allow channel owners and admins to update channels"
  ON chat_channels
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE chat_channel_members.channel_id = chat_channels.id AND chat_channel_members.user_id = auth.uid()::uuid AND chat_channel_members.role = ANY (ARRAY['owner', 'admin'])));

DROP POLICY IF EXISTS "Allow channel owners to delete channels" ON chat_channels;
CREATE POLICY "Allow channel owners to delete channels"
  ON chat_channels
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE chat_channel_members.channel_id = chat_channels.id AND chat_channel_members.user_id = auth.uid()::uuid AND chat_channel_members.role = 'owner'));

-- chat_messages
DROP POLICY IF EXISTS "Allow users to view messages in channels they are members of" ON chat_messages;
CREATE POLICY "Allow users to view messages in channels they are members of"
  ON chat_messages
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE chat_channel_members.channel_id = chat_messages.channel_id AND chat_channel_members.user_id = auth.uid()::uuid));

DROP POLICY IF EXISTS "Allow users to edit their own messages" ON chat_messages;
CREATE POLICY "Allow users to edit their own messages"
  ON chat_messages
  FOR UPDATE
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own messages" ON chat_messages;
CREATE POLICY "Allow users to delete their own messages"
  ON chat_messages
  FOR DELETE
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Allow channel admins to delete any message" ON chat_messages;
CREATE POLICY "Allow channel admins to delete any message"
  ON chat_messages
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE chat_channel_members.channel_id = chat_messages.channel_id AND chat_channel_members.user_id = auth.uid()::uuid AND chat_channel_members.role = ANY (ARRAY['owner', 'admin'])));

-- chat_typing_indicators
DROP POLICY IF EXISTS "Allow users to view typing indicators in channels they are memb" ON chat_typing_indicators;
CREATE POLICY "Allow users to view typing indicators in channels they are memb"
  ON chat_typing_indicators
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE chat_channel_members.channel_id = chat_typing_indicators.channel_id AND chat_channel_members.user_id = auth.uid()::uuid));

DROP POLICY IF EXISTS "Allow users to update their existing typing indicators" ON chat_typing_indicators;
CREATE POLICY "Allow users to update their existing typing indicators"
  ON chat_typing_indicators
  FOR UPDATE
  USING (auth.uid()::uuid = user_id);

-- admin_permissions
DROP POLICY IF EXISTS "Users can view their own permissions" ON admin_permissions;
CREATE POLICY "Users can view their own permissions"
  ON admin_permissions
  FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Admins can manage all permissions" ON admin_permissions;
CREATE POLICY "Admins can manage all permissions"
  ON admin_permissions
  FOR ALL
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid()::uuid AND user_profiles.role = 'admin'));

-- streaming_sessions
DROP POLICY IF EXISTS "Users can view active streams" ON streaming_sessions;
CREATE POLICY "Users can view active streams"
  ON streaming_sessions
  FOR SELECT
  USING (((status)::text = ANY (ARRAY['live', 'scheduled'])) OR (auth.uid()::uuid = created_by));

DROP POLICY IF EXISTS "Stream creators can update their streams" ON streaming_sessions;
CREATE POLICY "Stream creators can update their streams"
  ON streaming_sessions
  FOR UPDATE
  USING (auth.uid()::uuid = created_by);

DROP POLICY IF EXISTS "Stream creators can delete their streams" ON streaming_sessions;
CREATE POLICY "Stream creators can delete their streams"
  ON streaming_sessions
  FOR DELETE
  USING (auth.uid()::uuid = created_by);

-- departments
DROP POLICY IF EXISTS "Users can update departments they created" ON departments;
CREATE POLICY "Users can update departments they created"
  ON departments
  FOR UPDATE
  USING (created_by = auth.uid()::uuid);

DROP POLICY IF EXISTS "Users can delete departments they created" ON departments;
CREATE POLICY "Users can delete departments they created"
  ON departments
  FOR DELETE
  USING (created_by = auth.uid()::uuid);

-- department_activities
DROP POLICY IF EXISTS "Users can update activities they created" ON department_activities;
CREATE POLICY "Users can update activities they created"
  ON department_activities
  FOR UPDATE
  USING (created_by = auth.uid()::uuid);

DROP POLICY IF EXISTS "Users can delete activities they created" ON department_activities;
CREATE POLICY "Users can delete activities they created"
  ON department_activities
  FOR DELETE
  USING (created_by = auth.uid()::uuid);

-- stream_donations
DROP POLICY IF EXISTS "Users can view stream donations" ON stream_donations;
CREATE POLICY "Users can view stream donations"
  ON stream_donations
  FOR SELECT
  USING ((NOT is_anonymous) OR (auth.uid()::uuid = donor_id));

-- chat_reactions
DROP POLICY IF EXISTS "Allow users to view reactions in channels they are members of" ON chat_reactions;
CREATE POLICY "Allow users to view reactions in channels they are members of"
  ON chat_reactions
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM (chat_messages JOIN chat_channel_members ON (chat_messages.channel_id = chat_channel_members.channel_id)) WHERE chat_messages.id = chat_reactions.message_id AND chat_channel_members.user_id = auth.uid()::uuid));

DROP POLICY IF EXISTS "Allow users to delete their own reactions" ON chat_reactions;
CREATE POLICY "Allow users to delete their own reactions"
  ON chat_reactions
  FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- stream_prayer_requests
DROP POLICY IF EXISTS "Users can view prayer requests" ON stream_prayer_requests;
CREATE POLICY "Users can view prayer requests"
  ON stream_prayer_requests
  FOR SELECT
  USING ((NOT is_anonymous) OR (auth.uid()::uuid = requester_id));

-- chat_read_receipts
DROP POLICY IF EXISTS "Allow users to view read receipts in channels they are members " ON chat_read_receipts;
CREATE POLICY "Allow users to view read receipts in channels they are members "
  ON chat_read_receipts
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members WHERE chat_channel_members.channel_id = chat_read_receipts.channel_id AND chat_channel_members.user_id = auth.uid()::uuid));

DROP POLICY IF EXISTS "Allow users to update their existing read receipts" ON chat_read_receipts;
CREATE POLICY "Allow users to update their existing read receipts"
  ON chat_read_receipts
  FOR UPDATE
  USING (auth.uid()::uuid = user_id);

-- chat_channel_members
DROP POLICY IF EXISTS "Allow users to view channel members in channels they are member" ON chat_channel_members;
CREATE POLICY "Allow users to view channel members in channels they are member"
  ON chat_channel_members
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM chat_channel_members members WHERE members.channel_id = chat_channel_members.channel_id AND members.user_id = auth.uid()::uuid));

DROP POLICY IF EXISTS "Allow channel owners and admins to update channel members" ON chat_channel_members;
CREATE POLICY "Allow channel owners and admins to update channel members"
  ON chat_channel_members
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM chat_channel_members members WHERE members.channel_id = chat_channel_members.channel_id AND members.user_id = auth.uid()::uuid AND members.role = ANY (ARRAY['owner', 'admin'])));

DROP POLICY IF EXISTS "Allow users to leave channels" ON chat_channel_members;
CREATE POLICY "Allow users to leave channels"
  ON chat_channel_members
  FOR DELETE
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Allow channel owners and admins to remove members" ON chat_channel_members;
CREATE POLICY "Allow channel owners and admins to remove members"
  ON chat_channel_members
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM chat_channel_members members WHERE members.channel_id = chat_channel_members.channel_id AND members.user_id = auth.uid()::uuid AND members.role = ANY (ARRAY['owner', 'admin'])));

-- external_streaming_providers
DROP POLICY IF EXISTS "Allow authenticated users to view external providers" ON external_streaming_providers;
CREATE POLICY "Allow authenticated users to view external providers"
  ON external_streaming_providers
  FOR SELECT
  USING ((auth.uid() IS NOT NULL) AND (is_active = true));

-- collaborative_documents
DROP POLICY IF EXISTS "Allow users to update their collaborative documents" ON collaborative_documents;
CREATE POLICY "Allow users to update their collaborative documents"
  ON collaborative_documents
  FOR UPDATE
  USING ((auth.uid()::uuid = created_by) OR (auth.uid()::uuid = updated_by));

DROP POLICY IF EXISTS "Allow users to delete their collaborative documents" ON collaborative_documents;
CREATE POLICY "Allow users to delete their collaborative documents"
  ON collaborative_documents
  FOR DELETE
  USING (auth.uid()::uuid = created_by);

-- features
DROP POLICY IF EXISTS "Allow only admins to update features" ON features;
CREATE POLICY "Allow only admins to update features"
  ON features
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid()::uuid AND user_profiles.role = 'admin'));

DROP POLICY IF EXISTS "Allow admins to update features" ON features;
CREATE POLICY "Allow admins to update features"
  ON features
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid()::uuid AND user_profiles.role = 'admin'));

DROP POLICY IF EXISTS "Allow admins to delete features" ON features;
CREATE POLICY "Allow admins to delete features"
  ON features
  FOR DELETE
  USING (EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid()::uuid AND user_profiles.role = 'admin'));

-- user_profiles
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  USING (auth.uid()::uuid = id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  USING (auth.uid()::uuid = id);

-- user_preferences
DROP POLICY IF EXISTS "user_preferences_select_policy" ON user_preferences;
CREATE POLICY "user_preferences_select_policy"
  ON user_preferences
  FOR SELECT
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "user_preferences_update_policy" ON user_preferences;
CREATE POLICY "user_preferences_update_policy"
  ON user_preferences
  FOR UPDATE
  USING (auth.uid()::uuid = user_id);

-- presence
DROP POLICY IF EXISTS "Allow users to update their own presence data" ON presence;
CREATE POLICY "Allow users to update their own presence data"
  ON presence
  FOR UPDATE
  USING (auth.uid()::uuid = user_id);

DROP POLICY IF EXISTS "Allow users to delete their own presence data" ON presence;
CREATE POLICY "Allow users to delete their own presence data"
  ON presence
  FOR DELETE
  USING (auth.uid()::uuid = user_id);

-- care_records
DROP POLICY IF EXISTS "Care team can view all care records" ON care_records;
CREATE POLICY "Care team can view all care records"
  ON care_records
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM care_team_members ctm WHERE ctm.member_id = auth.uid()::uuid AND ctm.active = true));

DROP POLICY IF EXISTS "Members can view their own care records" ON care_records;
CREATE POLICY "Members can view their own care records"
  ON care_records
  FOR SELECT
  USING (member_id = auth.uid()::uuid);

-- prayer_requests
DROP POLICY IF EXISTS "Public prayer requests are viewable by all" ON prayer_requests;
CREATE POLICY "Public prayer requests are viewable by all"
  ON prayer_requests
  FOR SELECT
  USING ((is_public = true) OR (member_id = auth.uid()::uuid));

DROP POLICY IF EXISTS "Care team can view all prayer requests" ON prayer_requests;
CREATE POLICY "Care team can view all prayer requests"
  ON prayer_requests
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM care_team_members ctm WHERE ctm.member_id = auth.uid()::uuid AND ctm.active = true));

-- care_team_members
DROP POLICY IF EXISTS "Care team members can view their own records" ON care_team_members;
CREATE POLICY "Care team members can view their own records"
  ON care_team_members
  FOR SELECT
  USING (member_id = auth.uid()::uuid);

-- crisis_alerts
DROP POLICY IF EXISTS "Care team can view crisis alerts" ON crisis_alerts;
CREATE POLICY "Care team can view crisis alerts"
  ON crisis_alerts
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM care_team_members ctm WHERE ctm.member_id = auth.uid()::uuid AND ctm.active = true));

-- counseling_sessions
DROP POLICY IF EXISTS "Counselors can view their sessions" ON counseling_sessions;
CREATE POLICY "Counselors can view their sessions"
  ON counseling_sessions
  FOR SELECT
  USING ((counselor_id = auth.uid()::uuid) OR (member_id = auth.uid()::uuid));

-- prayer_interactions
DROP POLICY IF EXISTS "Members can view their prayer interactions" ON prayer_interactions;
CREATE POLICY "Members can view their prayer interactions"
  ON prayer_interactions
  FOR SELECT
  USING (member_id = auth.uid()::uuid);

-- care_assignments
DROP POLICY IF EXISTS "Care team can view assignments" ON care_assignments;
CREATE POLICY "Care team can view assignments"
  ON care_assignments
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM care_team_members ctm WHERE ctm.member_id = auth.uid()::uuid AND ctm.active = true)); 