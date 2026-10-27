Pod::Spec.new do |s|
  s.name           = 'Health'
  s.version        = '1.0.0'
  s.summary        = 'Reads Apple Health data for Mayg & Jaown'
  s.description    = 'Read-only access to body weight, sleep, HRV and resting heart rate.'
  s.author         = 'John DiCesare'
  s.homepage       = 'https://example.com'
  s.license        = { :type => 'MIT' }
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'
  s.frameworks = 'HealthKit'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift}'
end
