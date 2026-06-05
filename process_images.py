from PIL import Image

def remove_white_bg(input_path, output_path, tolerance=240):
    try:
        img = Image.open(input_path).convert("RGBA")
        data = img.getdata()
        new_data = []
        for item in data:
            if item[0] >= tolerance and item[1] >= tolerance and item[2] >= tolerance:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        img.putdata(new_data)
        img.save(output_path, "PNG")
        print(f"Successfully processed {input_path}")
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

remove_white_bg("public/logo_jacqueline.jpg", "public/logo_jacqueline.png", tolerance=235)
remove_white_bg("public/fleurs_jacqueline.jpg", "public/fleurs_jacqueline.png", tolerance=235)
