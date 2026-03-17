CREATE TABLE council_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text DEFAULT 'New Council Session',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE council_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own council conversations"
  ON council_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own council conversations"
  ON council_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own council conversations"
  ON council_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own council conversations"
  ON council_conversations FOR DELETE USING (auth.uid() = user_id);