import requests
import json
import random

# Admin token
token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJlZjM1NjljZC00YzY4LTQwNTktODc3MS1mZDc0NDE4ZDNiYjEiLCJleHAiOjE3NjQxMTMwMTl9.WUECf6yafamo9yG3XeCH2bTb58Q583sj3gxeDBeTRXY"
headers = {
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json"
}

# SADECE AYAKKABI ÜRÜN FOTOĞRAFLARI - İNSAN YOK
# Farklı Unsplash photo ID'leri - sadece ayakkabı ürün çekimleri (product shots)
# Bu ID'ler sadece ayakkabı gösterir, insan yok
shoe_only_product_images = [
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=4000",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=4000",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=4000",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=4000",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=4000",
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=4000",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=4000",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=4000",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=4000",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=4000",
    "https://images.unsplash.com/photo-1605030753298-c9c5c5e0c0b0?w=4000",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=4000",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=4000",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=4000",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=4000",
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=4000",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=4000",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=4000",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=4000",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=4000",
    "https://images.unsplash.com/photo-1605030753298-c9c5c5e0c0b0?w=4000",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=4000",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=4000",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=4000",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=4000",
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=4000",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=4000",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=4000",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=4000",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=4000",
    "https://images.unsplash.com/photo-1605030753298-c9c5c5e0c0b0?w=4000",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=4000",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=4000",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=4000",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=4000",
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=4000",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=4000",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=4000",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=4000",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=4000",
    "https://images.unsplash.com/photo-1605030753298-c9c5c5e0c0b0?w=4000",
    "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=4000",
    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=4000",
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=4000",
    "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=4000",
    "https://images.unsplash.com/photo-1605348532760-6753d2c43329?w=4000",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=4000",
    "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=4000",
    "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=4000",
    "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=4000",
]

# Get all products
response = requests.get("http://127.0.0.1:8000/api/products")
products = response.json()

print(f"Toplam {len(products)} urun bulundu")

# Test each image URL and keep only working ones
print("\nSADECE AYAKKABI gorsel URL'leri test ediliyor (INSAN YOK)...")
working_images = []
for img_url in shoe_only_product_images:
    try:
        test_response = requests.head(img_url, timeout=5, allow_redirects=True)
        if test_response.status_code == 200:
            working_images.append(img_url)
    except:
        try:
            test_response = requests.get(img_url, timeout=5, stream=True)
            if test_response.status_code == 200:
                working_images.append(img_url)
        except:
            pass

# Remove duplicates
working_images = list(dict.fromkeys(working_images))

print(f"{len(working_images)} benzersiz calisan AYAKKABI gorseli bulundu")

# Shuffle to ensure different images for each product
random.shuffle(working_images)

# Update each product with SHOE-ONLY images (NO PEOPLE)
updated = 0
used_images = set()
for i, product in enumerate(products):
    if product.get('category') and ('Ayakkabı' in product['category'] or 'Bot' in product['category'] or product['category'] in ['Electronics', 'Clothing']):
        # Find an unused image
        image_url = None
        for img in working_images:
            if img not in used_images:
                image_url = img
                used_images.add(img)
                break
        
        # If all images used, cycle through
        if not image_url:
            image_url = working_images[i % len(working_images)]
        
        update_data = {
            "name": product['name'],
            "description": product['description'],
            "price": product['price'],
            "category": product['category'],
            "image_url": image_url,
            "stock": product['stock']
        }
        
        try:
            update_response = requests.put(
                f"http://127.0.0.1:8000/api/products/{product['id']}",
                json=update_data,
                headers=headers
            )
            if update_response.status_code == 200:
                updated += 1
                print(f"OK: {product['name']}")
            else:
                print(f"ERROR: {product['name']} - {update_response.status_code}")
        except Exception as e:
            print(f"ERROR: {product['name']} - {e}")

print(f"\nToplam {updated} urun guncellendi!")
print(f"SADECE AYAKKABI FOTOGRAFLARI - INSAN YOK!")
print(f"ONEMLI: Tarayici onbellegini temizleyin (Ctrl+Shift+Delete) ve sayfayi yenileyin (Ctrl+F5)!")
