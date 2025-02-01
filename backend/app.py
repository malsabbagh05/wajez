from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from werkzeug.utils import secure_filename
from PIL import Image, ImageEnhance
import pytesseract
import io
import fitz  # PyMuPDF for PDF processing
from openai import OpenAI
from dotenv import load_dotenv
import time
import tiktoken

# Load environment variables
load_dotenv()

# Initialize OpenAI clients
default_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
deepseek_client = OpenAI(api_key=os.getenv('DEEPSEEK_API_KEY'), base_url="https://api.deepseek.com")

# Set Tesseract path for Windows
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

app = Flask(__name__)
CORS(app, resources={
    r"/analyze": {
        "origins": ["http://localhost:5173"],
        "methods": ["POST"],
        "allow_headers": ["Content-Type"]
    }
})

# Supported file types
SUPPORTED_FILE_TYPES = {
    '.pdf': 'application/pdf',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
}

def count_tokens(text, model="gpt-4o"):
    """Count the number of tokens in a text string"""
    encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))

def perform_ocr_on_image(image):
    """Perform OCR on an image"""
    ocr_start = time.time()
    try:
        # Convert to grayscale if not already
        if image.mode != 'L':
            image = image.convert('L')

        # Enhance contrast and sharpness
        enhancer = ImageEnhance.Contrast(image)
        image = enhancer.enhance(2.0)
        enhancer = ImageEnhance.Sharpness(image)
        image = enhancer.enhance(2.0)

        # Perform OCR
        text = pytesseract.image_to_string(image, lang='eng+ara', config=r'--oem 3 --psm 6')
        ocr_time = time.time() - ocr_start
        print(f"OCR Processing Time: {ocr_time:.1f} seconds")
        return text.strip() if text.strip() else None

    except Exception as e:
        ocr_time = time.time() - ocr_start
        print(f"OCR Error after {ocr_time:.1f} seconds: {str(e)}")
        return None

def process_with_llm(content, use_deep_thinker=False):
    """Process extracted text with LLM to create insightful tables and JSON data"""
    start_time = time.time()
    try:
        # Select the appropriate client and log the selection
        client = deepseek_client if use_deep_thinker else default_client
        model = "deepseek-reasoner" if use_deep_thinker else "gpt-4o"
        api_base = "Deepseek API" if use_deep_thinker else "OpenAI API"
        
        # Count input tokens
        input_tokens = count_tokens(content)
        
        print("\n" + "-"*50)
        print("LLM PROCESSING START")
        print("-"*50)
        print(f"Model: {model}")
        print(f"API: {api_base}")
        print(f"Deep Thinker: {'✓' if use_deep_thinker else '✗'}")
        print(f"Input Tokens: {input_tokens}")
        print("-"*50)

        # First get the table format for display
        table_prompt = """You are a data analyst that specializes in extracting and organizing information into insightful tables.
        
        Guidelines:
        1. Focus ONLY on creating informative tables from the data
        2. Look for patterns, statistics, and interesting insights in the data
        3. If you find missing or incomplete information, create a table highlighting these gaps
        4. Group related information into separate tables
        5. Include summary tables when dealing with large datasets
        6. Add a brief title above each table explaining what it shows
        
        Output Format:
        - Use proper HTML table format with <table>, <thead>, <tbody>, <tr>, <th>, and <td> tags
        - Add CSS classes for styling: 'category-table' for the table element
        - Use <h3> tags for table titles
        - Example structure:
          <h3>Title of the Table</h3>
          <table class="category-table">
            <thead>
              <tr>
                <th>Header 1</th>
                <th>Header 2</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Data 1</td>
                <td>Data 2</td>
              </tr>
            </tbody>
          </table>
        
        Remember:
        - Only respond with HTML tables and their titles
        - Don't include any additional text or explanations
        - Focus on presenting insights rather than raw data
        - Create multiple tables if you find different types of information
        - Use clear, concise table headers

        Arabic Language:
        - Use Arabic language when there is Arabic text in the content.
        """

        # Table Generation
        table_start = time.time()
        print("\nGenerating table format...")
        table_response = client.chat.completions.create(
            model="deepseek-reasoner" if use_deep_thinker else "gpt-4o",
            messages=[
                {"role": "system", "content": table_prompt},
                {"role": "user", "content": f"Analyze this content and create insightful tables showing patterns, statistics, and any missing or incomplete information:\n\n{content}"}
            ],
            temperature=1.3 if use_deep_thinker else 0.7,
            max_tokens=4000,
        )
        table_time = time.time() - table_start
        table_tokens = {
            'prompt_tokens': table_response.usage.prompt_tokens,
            'completion_tokens': table_response.usage.completion_tokens,
            'total_tokens': table_response.usage.total_tokens
        }
        print(f"Table Generation: {table_time:.1f} seconds")
        print(f"Table Tokens - Prompt: {table_tokens['prompt_tokens']}, Completion: {table_tokens['completion_tokens']}, Total: {table_tokens['total_tokens']}")

        # Now get JSON format with a more open-ended prompt
        json_prompt = """You are a data analyst that extracts structured data into JSON format.
        
        Guidelines:
        1. Analyze the content and create a meaningful JSON structure that best represents the data
        2. Include all relevant information, patterns, and insights you find
        3. Use appropriate data types (strings, numbers, arrays, nested objects)
        4. Group related information logically
        5. Include any metadata that might be useful
        6. Add analysis or insights that could be valuable
        7. Structure the data in a way that would be most useful for programmatic processing
        
        Important:
        - You have complete freedom in designing the JSON structure
        - Focus on creating a structure that makes sense for the specific content
        - Include any insights or patterns you notice
        - Use descriptive key names
        - Maintain data relationships in your structure
        
        Arabic Language:
        - Use Arabic language when there is Arabic text in the content.
        """

        # JSON Generation
        json_start = time.time()
        print("\nGenerating JSON format...")
        json_response = client.chat.completions.create(
            model="deepseek-reasoner" if use_deep_thinker else "gpt-4o",
            messages=[
                {"role": "system", "content": json_prompt},
                {"role": "user", "content": f"Create a meaningful JSON structure from this content:\n\n{content}"}
            ],
            temperature=1.3 if use_deep_thinker else 0.7,
            max_tokens=4000,
        )
        json_time = time.time() - json_start
        json_tokens = {
            'prompt_tokens': json_response.usage.prompt_tokens,
            'completion_tokens': json_response.usage.completion_tokens,
            'total_tokens': json_response.usage.total_tokens
        }
        print(f"JSON Generation: {json_time:.1f} seconds")
        print(f"JSON Tokens - Prompt: {json_tokens['prompt_tokens']}, Completion: {json_tokens['completion_tokens']}, Total: {json_tokens['total_tokens']}")

        # Parse and validate JSON response
        table_content = table_response.choices[0].message.content
        json_content = json_response.choices[0].message.content

        # Ensure JSON is properly formatted (remove any markdown formatting if present)
        if json_content.startswith('```json'):
            json_content = json_content.replace('```json', '').replace('```', '').strip()

        # Calculate total tokens used
        total_tokens = {
            'prompt_tokens': table_tokens['prompt_tokens'] + json_tokens['prompt_tokens'],
            'completion_tokens': table_tokens['completion_tokens'] + json_tokens['completion_tokens'],
            'total_tokens': table_tokens['total_tokens'] + json_tokens['total_tokens']
        }

        # Final timing and token summary
        total_time = time.time() - start_time
        print("\n" + "-"*50)
        print("LLM PROCESSING COMPLETE")
        print("-"*50)
        print(f"Table Generation: {table_time:.1f} seconds")
        print(f"JSON Generation: {json_time:.1f} seconds")
        print(f"Total LLM Time: {total_time:.1f} seconds")
        print("\nTOKEN USAGE SUMMARY")
        print(f"Input Tokens: {input_tokens}")
        print(f"Total Prompt Tokens: {total_tokens['prompt_tokens']}")
        print(f"Total Completion Tokens: {total_tokens['completion_tokens']}")
        print(f"Total Tokens Used: {total_tokens['total_tokens']}")
        print("-"*50 + "\n")
        
        return {
            'display': table_content,
            'json_data': json_content,
            'token_usage': total_tokens
        }
    except Exception as e:
        error_time = time.time() - start_time
        print("\n" + "!"*50)
        print("LLM PROCESSING ERROR")
        print("!"*50)
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print(f"Time until error: {error_time:.1f} seconds")
        print("!"*50 + "\n")
        return None

def process_pdf(pdf_path, use_deep_thinker=False):
    """Process PDF file, extracting both text and images"""
    pdf_start = time.time()
    try:
        doc = fitz.open(pdf_path)
        all_text = []
        
        print("\n" + "="*50)
        print("PDF PROCESSING START")
        print("="*50)
        
        text_extraction_start = time.time()
        for page_num, page in enumerate(doc, 1):
            page_start = time.time()
            
            # Extract text
            page_text = page.get_text().strip()
            if page_text:
                all_text.append(f"Page {page_num} Text:\n{page_text}")
                page_time = time.time() - page_start
                print(f"Page {page_num} Text Extraction: {page_time:.1f} seconds")

            # Process images if present
            image_list = page.get_images()
            if image_list:
                print(f"\nFound {len(image_list)} images in page {page_num}")
                
                for img_index, image in enumerate(image_list):
                    img_start = time.time()
                    try:
                        xref = image[0]
                        base_image = doc.extract_image(xref)
                        image_bytes = base_image["image"]
                        image = Image.open(io.BytesIO(image_bytes))
                        
                        print(f"\nProcessing Image {img_index + 1} on Page {page_num}")
                        ocr_text = perform_ocr_on_image(image)
                        if ocr_text:
                            all_text.append(f"Page {page_num} Image {img_index + 1} Text:\n{ocr_text}")
                        
                        img_time = time.time() - img_start
                        print(f"Image {img_index + 1} Processing Time: {img_time:.1f} seconds")
                        
                    except Exception as img_error:
                        img_time = time.time() - img_start
                        print(f"Error processing image {img_index + 1} on page {page_num} after {img_time:.1f} seconds: {str(img_error)}")

        text_extraction_time = time.time() - text_extraction_start
        print("\n" + "-"*50)
        print("TEXT EXTRACTION COMPLETE")
        print(f"Total Text Extraction Time: {text_extraction_time:.1f} seconds")
        print("-"*50)

        # Process with LLM
        combined_text = "\n\n".join(all_text)
        if combined_text:
            print(f"\nStarting LLM Processing")
            print(f"Deep Thinker: {'✓' if use_deep_thinker else '✗'}")
            llm_start = time.time()
            llm_result = process_with_llm(combined_text, use_deep_thinker)
            llm_time = time.time() - llm_start
            
            total_time = time.time() - pdf_start
            print("\n" + "="*50)
            print("PDF PROCESSING COMPLETE")
            print("="*50)
            print(f"Text Extraction Time: {text_extraction_time:.1f} seconds")
            print(f"LLM Processing Time: {llm_time:.1f} seconds")
            print(f"Total Processing Time: {total_time:.1f} seconds")
            print("="*50 + "\n")
            
            return llm_result if llm_result else "Error processing with LLM. Raw text:\n\n" + combined_text
        return "No text content found in the PDF."

    except Exception as e:
        total_time = time.time() - pdf_start
        print(f"PDF processing error after {total_time:.1f} seconds: {str(e)}")
        return f"Error processing PDF: {str(e)}"

def analyze_file(file_path, use_deep_thinker=False):
    """Analyze file content"""
    try:
        file_ext = os.path.splitext(file_path.lower())[1]
        
        if file_ext == '.pdf':
            result = process_pdf(file_path, use_deep_thinker)
            if isinstance(result, dict) and 'display' in result:
                return {
                    'result': result['display'],      # Table format for display
                    'json_data': result['json_data']  # JSON format for download
                }
            return {'result': result}
        elif file_ext in SUPPORTED_FILE_TYPES:
            with Image.open(file_path) as image:
                if image.mode == 'RGBA':
                    image = image.convert('RGB')
                
                text = perform_ocr_on_image(image)
                if not text:
                    return {'result': "No text detected in the image."}
                
                result = process_with_llm(text, use_deep_thinker)
                if isinstance(result, dict) and 'display' in result:
                    return {
                        'result': result['display'],      # Table format for display
                        'json_data': result['json_data']  # JSON format for download
                    }
                return {'result': result}
        else:
            return {'result': "Unsupported file type. Please upload a PDF or image file."}
        
    except Exception as e:
        print(f"File analysis error: {str(e)}")
        return {'result': f"Error analyzing file: {str(e)}"}

@app.route('/analyze', methods=['POST'])
def analyze():
    total_start_time = time.time()
    
    if 'file' not in request.files:
        return jsonify({'result': 'No file uploaded'})

    file = request.files['file']
    if file.filename == '':
        return jsonify({'result': 'No file selected'})

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join('uploads', filename)
        os.makedirs('uploads', exist_ok=True)
        file.save(file_path)

        try:
            use_deep_thinker = request.form.get('useDeepThinker', 'false').lower() == 'true'
            print("\n" + "="*50)
            print(f"STARTING ANALYSIS: {filename}")
            print(f"Deep Thinker: {'✓' if use_deep_thinker else '✗'}")
            print("="*50)
            
            analysis_start = time.time()
            result = analyze_file(file_path, use_deep_thinker)
            analysis_end = time.time()
            
            total_time = time.time() - total_start_time
            analysis_time = analysis_end - analysis_start
            
            print("\n" + "="*50)
            print("TIMING SUMMARY")
            print("="*50)
            print(f"Total Request Time: {total_time:.1f} seconds")
            print(f"Analysis Time: {analysis_time:.1f} seconds")
            print(f"Overhead Time: {(total_time - analysis_time):.1f} seconds")
            print("="*50 + "\n")
            
            return jsonify(result)
        finally:
            if os.path.exists(file_path):
                os.remove(file_path)
    
    return jsonify({'result': 'Error processing file'})

if __name__ == '__main__':
    try:
        print(f"Tesseract Version: {pytesseract.get_tesseract_version()}")
        print(f"Tesseract Path: {pytesseract.pytesseract.tesseract_cmd}")
    except Exception as e:
        print(f"Error getting Tesseract info: {str(e)}")
        
    os.makedirs('temp', exist_ok=True)
    app.run(debug=True, port=5000) 