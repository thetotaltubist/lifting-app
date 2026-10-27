import ExpoModulesCore
import HealthKit

// Read-only Apple Health access: body weight, sleep, HRV and resting heart
// rate. Oura and Eight Sleep reach the app through Health. Nothing is
// written back.
public class HealthModule: Module {
  private let store = HKHealthStore()
  private let iso = ISO8601DateFormatter()

  private var readTypes: Set<HKObjectType> {
    var types = Set<HKObjectType>()
    if let t = HKQuantityType.quantityType(forIdentifier: .bodyMass) { types.insert(t) }
    if let t = HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN) { types.insert(t) }
    if let t = HKQuantityType.quantityType(forIdentifier: .restingHeartRate) { types.insert(t) }
    if let t = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) { types.insert(t) }
    return types
  }

  private func since(_ days: Int) -> NSPredicate {
    let start = Calendar.current.date(byAdding: .day, value: -days, to: Date()) ?? Date()
    return HKQuery.predicateForSamples(withStart: start, end: Date(), options: [])
  }

  public func definition() -> ModuleDefinition {
    Name("Health")

    Function("isAvailable") { () -> Bool in
      return HKHealthStore.isHealthDataAvailable()
    }

    // Shows Apple's permission sheet the first time. iOS never tells apps
    // whether reading was allowed, so this only says the sheet was handled.
    AsyncFunction("requestAccess") { (promise: Promise) in
      guard HKHealthStore.isHealthDataAvailable() else {
        promise.resolve(false)
        return
      }
      self.store.requestAuthorization(toShare: nil, read: self.readTypes) { ok, _ in
        promise.resolve(ok)
      }
    }

    // Every weigh-in, in pounds
    AsyncFunction("bodyMass") { (days: Int, promise: Promise) in
      guard let type = HKQuantityType.quantityType(forIdentifier: .bodyMass) else {
        promise.resolve([])
        return
      }
      let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
      let query = HKSampleQuery(sampleType: type, predicate: self.since(days), limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { _, samples, _ in
        let out: [[String: Any]] = (samples as? [HKQuantitySample] ?? []).map {
          ["date": self.iso.string(from: $0.startDate), "lb": $0.quantity.doubleValue(for: .pound())]
        }
        promise.resolve(out)
      }
      self.store.execute(query)
    }

    // Hours asleep per night, keyed by the morning you woke up. Watch, Oura
    // and Eight Sleep often record the same night, so overlapping time is
    // only counted once.
    AsyncFunction("sleep") { (days: Int, promise: Promise) in
      guard let type = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) else {
        promise.resolve([])
        return
      }
      // 1 = asleep (unspecified), 3 = core, 4 = deep, 5 = REM
      let asleep: Set<Int> = [1, 3, 4, 5]
      let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
      let query = HKSampleQuery(sampleType: type, predicate: self.since(days + 1), limit: HKObjectQueryNoLimit, sortDescriptors: [sort]) { _, samples, _ in
        let spans = (samples as? [HKCategorySample] ?? [])
          .filter { asleep.contains($0.value) }
          .map { ($0.startDate, $0.endDate) }
          .sorted { $0.0 < $1.0 }
        var merged: [(Date, Date)] = []
        for span in spans {
          if let last = merged.last, span.0 <= last.1 {
            merged[merged.count - 1].1 = max(last.1, span.1)
          } else {
            merged.append(span)
          }
        }
        let day = DateFormatter()
        day.dateFormat = "yyyy-MM-dd"
        var nights: [String: Double] = [:]
        for (start, end) in merged {
          nights[day.string(from: end), default: 0] += end.timeIntervalSince(start) / 3600
        }
        let out: [[String: Any]] = nights.keys.sorted().map { ["night": $0, "hours": nights[$0]!] }
        promise.resolve(out)
      }
      self.store.execute(query)
    }

    // Daily averages for "hrv" (ms) or "restingHeartRate" (beats per minute)
    AsyncFunction("dailyAverage") { (kind: String, days: Int, promise: Promise) in
      let id: HKQuantityTypeIdentifier = kind == "hrv" ? .heartRateVariabilitySDNN : .restingHeartRate
      let unit: HKUnit = kind == "hrv" ? .secondUnit(with: .milli) : HKUnit.count().unitDivided(by: .minute())
      guard let type = HKQuantityType.quantityType(forIdentifier: id) else {
        promise.resolve([])
        return
      }
      let calendar = Calendar.current
      let end = Date()
      let start = calendar.startOfDay(for: calendar.date(byAdding: .day, value: -days, to: end) ?? end)
      let query = HKStatisticsCollectionQuery(
        quantityType: type,
        quantitySamplePredicate: HKQuery.predicateForSamples(withStart: start, end: end, options: []),
        options: .discreteAverage,
        anchorDate: start,
        intervalComponents: DateComponents(day: 1)
      )
      query.initialResultsHandler = { _, results, _ in
        var out: [[String: Any]] = []
        results?.enumerateStatistics(from: start, to: end) { stats, _ in
          if let value = stats.averageQuantity()?.doubleValue(for: unit) {
            out.append(["date": self.iso.string(from: stats.startDate), "value": value])
          }
        }
        promise.resolve(out)
      }
      self.store.execute(query)
    }
  }
}
