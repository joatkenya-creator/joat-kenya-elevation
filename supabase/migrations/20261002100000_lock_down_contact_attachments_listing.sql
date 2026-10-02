-- ─── Stop public listing of contact-attachments ──────────────────────────────
-- The "Public read on contact-attachments" SELECT policy let the anon key LIST
-- every file in the bucket (storage/v1/object/list), exposing CVs, cover
-- letters and receipts people sent through the contact form. The bucket is
-- public, so files are still served by their direct URL (which carries a
-- random UUID prefix and is only stored in contact_submissions) — the contact
-- form only uploads and calls getPublicUrl, neither of which needs SELECT.
-- Same fix as the applications bucket got in 20260610140000.

drop policy if exists "Public read on contact-attachments" on storage.objects;

-- The upload policy only checks the file NAME ends in .pdf (or the uploader-
-- supplied mimetype), and the bucket had no size cap — so anyone with the
-- anon key could park arbitrary content of any size on our storage under a
-- .pdf name. Enforce what the contact form already promises (PDF, 10 MB total)
-- at the bucket level, where Storage checks the actual upload.
update storage.buckets
  set file_size_limit = 10485760,               -- 10 MB
      allowed_mime_types = array['application/pdf']
  where id = 'contact-attachments';
