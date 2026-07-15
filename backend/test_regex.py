import sys
import json
from modules.regex_engine import regex_to_nfa_visual

def test():
    try:
        res = regex_to_nfa_visual("a|b*")
        print(json.dumps(res, indent=2))
        print("SUCCESS")
    except Exception as e:
        print(f"FAILED: {e}")
        sys.exit(1)

if __name__ == "__main__":
    test()
