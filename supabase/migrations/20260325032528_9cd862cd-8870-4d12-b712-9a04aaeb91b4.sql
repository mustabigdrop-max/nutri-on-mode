UPDATE public.meal_logs
SET meal_date = '2026-03-24'
WHERE id IN (
  'b990932b-c910-4f9f-a8ac-03f31224a97f',
  '64e71422-406f-4a60-ba3e-53b10fd00b98',
  'd10c6a86-de0d-4518-83c5-21c889c200a4',
  'dc6ac195-4e1c-4873-bd97-574f0d405ebc',
  '48767d61-d2cc-48dd-af69-5e9053f662e0',
  '8aacd71a-d0f1-4686-93b0-88faf6a3a48e'
)
AND meal_date = '2026-03-25';