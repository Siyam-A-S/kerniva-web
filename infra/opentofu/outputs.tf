output "bucket" {
  value = aws_s3_bucket.site.id
}

output "distribution_id" {
  value = aws_cloudfront_distribution.site.id
}

output "urls" {
  value = [for a in local.aliases : "https://${a}"]
}
