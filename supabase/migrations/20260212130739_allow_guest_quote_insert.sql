-- Allow guests (anon) to submit quotes without logging in (user_id stays null).
-- Logged-in users still submit with user_id = auth.uid() via "Users can submit their own quotes".
create policy "Guests can submit quotes"
  on public.quotes
  for insert
  to anon
  with check (user_id is null);
