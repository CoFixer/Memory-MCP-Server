# Design Extraction Guide

Execute this script when HTML prototypes exist in `.project/resources/HTML/`:

```bash
#!/bin/bash

if [ -d ".project/resources/HTML" ]; then
  HTML_FILE_COUNT=$(find .project/resources/HTML -name "*.html" 2>/dev/null | wc -l)
  
  if [ "$HTML_FILE_COUNT" -gt 0 ]; then
    echo "Found $HTML_FILE_COUNT HTML files. Extracting design system..."
    
    # Copy template
    cp .opencode/templates/project/docs/PROJECT_DESIGN_GUIDELINES.template.md \
       .project/docs/PROJECT_DESIGN_GUIDELINES.md
    
    sed -i "s/{PROJECT_NAME}/$PROJECT_NAME/g" .project/docs/PROJECT_DESIGN_GUIDELINES.md
    sed -i "s/{DATE}/$(date +%Y-%m-%d)/g" .project/docs/PROJECT_DESIGN_GUIDELINES.md
    
    HTML_DIR=".project/resources/HTML"
    OUTPUT_FILE=".project/docs/PROJECT_DESIGN_GUIDELINES.md"
    
    # Extract Tailwind config hints
    echo "" >> "$OUTPUT_FILE"
    echo "## Extracted Patterns" >> "$OUTPUT_FILE"
    echo "" >> "$OUTPUT_FILE"
    
    # Extract color classes
    echo "### Color System" >> "$OUTPUT_FILE"
    grep -rho 'text-[a-z]*-[0-9]*\|bg-[a-z]*-[0-9]*' "$HTML_DIR" | sort -u | head -20 >> "$OUTPUT_FILE"
    
    echo "✓ Generated $OUTPUT_FILE"
  else
    echo "No HTML files found in .project/resources/HTML/"
  fi
else
  echo "No HTML directory found."
fi
```

## Output

- File: `.project/docs/PROJECT_DESIGN_GUIDELINES.md`
- Contains: Color palette, typography, spacing, component states
