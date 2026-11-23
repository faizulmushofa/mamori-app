-- =====================================================================
-- MAMORI — Skrip Pembersihan Data Uji Integrasi (Automated Test Sweeper)
-- Menghapus seluruh data pengujian otomatis (email berawalan itest+ atau itest_)
-- =====================================================================

do $$
declare
  v_test_user record;
begin
  for v_test_user in
    select id, email from auth.users
    where email like 'itest+%' or email like 'itest_%'
  loop
    -- Hapus objek storage yang dibuat oleh user uji
    delete from storage.objects
    where (storage.foldername(name))[1] = v_test_user.id::text;

    -- Hapus dari auth.users (akan cascade ke profiles, reports, report_attachments, dll)
    delete from auth.users where id = v_test_user.id;
    
    raise notice 'Membersihkan akun uji: % (%)', v_test_user.email, v_test_user.id;
  end loop;

  -- Bersihkan attachment yang berstatus pending lebih dari 24 jam (orphan cleaner)
  delete from public.report_attachments
  where photo_status = 'pending' and created_at < now() - interval '24 hours';
end $$;
