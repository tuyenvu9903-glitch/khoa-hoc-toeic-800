# Giọng đọc thu sẵn (VieNeu-TTS)

Web phát file MP3 thu sẵn trong `web/public/tts/` thay cho giọng đọc của trình duyệt:

- **Tiếng Anh**: mọi câu Part 2/3/4, lời dẫn "Questions … refer to …", chữ cái A–D và từ vựng.
- **Tiếng Việt**: lời thoại của Tám (chỉ các câu không có `{name}`, `{n}`…).

Câu nào chưa có file thì web tự quay về giọng của trình duyệt, nên thiếu file không làm hỏng app.

Giọng được tạo bằng [VieNeu-TTS](https://github.com/pnnbao97/VieNeu-TTS) v3 Turbo (Apache 2.0),
dùng giọng dựng sẵn. Chọn giọng cho từng vai trong `web/src/lib/tts.ts` (`ROLE_VOICE`,
`MASCOT_VOICE`, `WORD_VOICE`). Không clone giọng của người khác khi chưa được đồng ý.

## Sau khi thêm câu hỏi, từ vựng hoặc lời thoại

```bash
cd web && npm run tts:export        # cập nhật tools/tts/catalog.json
cd .. && python tools/tts/generate.py   # chỉ sinh các câu còn thiếu, chạy lại được
```

Cài một lần: `pip install vieneu av numpy` (Python 3.10+, chạy được trên CPU, khoảng 2–3 giây mỗi câu).
Thêm `--prune` để xóa file của câu đã bị xóa khỏi catalog.
