bucket         = "kerniva-tofu-state-<account>"
key            = "kerniva-web/<environment>.tfstate"
region         = "us-east-1"
dynamodb_table = "kerniva-tofu-locks"
encrypt        = true
